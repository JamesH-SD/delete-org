import { Logger } from "@aws-lambda-powertools/logger";
import { Knex } from "knex";
import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";
import {
  ApplicationError,
  DatabaseError,
  ValidationError,
} from "@acivilate/shared-code";
import { User } from "../types";

type PubSubConfig = {
  config: {
    topicArn: string;
  };
  client: SNSClient;
};

type ConstructorArgs = {
  logger: Logger;
  dbClient?: Knex;
  pubSubConfig?: PubSubConfig;
};

export class UserService {
  private readonly logger: Logger;
  private readonly dbClient: Knex | undefined;
  private readonly pubSubConfig: PubSubConfig | undefined;
  static instance: UserService | null = null;
  constructor({
    logger,
    dbClient,
    pubSubConfig: pubSubClient,
  }: ConstructorArgs) {
    this.logger = logger;
    this.dbClient = dbClient;
    this.pubSubConfig = pubSubClient;
  }
  static getInstance({
    logger,
    dbClient,
    pubSubConfig: pubSubClient,
  }: ConstructorArgs): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService({
        logger,
        dbClient,
        pubSubConfig: pubSubClient,
      });
    }
    return UserService.instance;
  }
  async getUsersByOrganizationId(orgId: string): Promise<any[]> {
    if (this.dbClient === undefined) {
      const msg = "dbClient config is not defined";
      this.logger.error(msg);
      throw new ValidationError(msg);
    }

    this.logger.info(`Getting organization with id: ${orgId}`);
    this.logger.debug("dbClient", { dbClient: this.dbClient });
    // Get organization from database
    try {
      const users: User[] = await this.dbClient
        // professional users
        .select(
          "pu.pokket_user_id as id",
          "pu.user_name as username",
          "pu.ssn as agencyId",
          this.dbClient.raw("null as onboardedBy"),
          this.dbClient.raw("'professional' as type"),
        )
        .from("pokket_user as pu")
        .innerJoin(
          "pokket_user_organization as puo",
          "pu.pokket_user_id",
          "puo.pokket_user_id",
        )
        .where({ "puo.organization_id": orgId })
        .unionAll([
          this.dbClient
            // participant users
            .select(
              "pu.pokket_user_id as id",
              "pu.user_name as username",
              "pu.ssn as agencyId",
              this.dbClient.raw("null as onboardedBy"),
              this.dbClient.raw("'participant' as type"),
            )
            .from("pokket_user as pu")
            .innerJoin(
              "participant as p",
              "pu.pokket_user_id",
              "p.pokket_user_id",
            )
            .innerJoin("organization as o", "p.contract_id", "o.contract_id")
            .where({ "o.organization_id": orgId }),
        ]);
      this.logger.debug("getOrganizationUsers sample of 10", {
        users: users.slice(0, 10),
      });
      return users;
    } catch (error) {
      if (error instanceof Error) {
        const dbError = new DatabaseError(error.message);
        this.logger.error(error.message, { error });
        throw dbError;
      }
      const appError = new ApplicationError(
        `Error getting organization users with organization id: ${orgId}`,
      );
      this.logger.error(appError.message, {
        error,
      });
      throw appError;
    }
  }

  async deleteUser(userId: string): Promise<void> {
    if (this.dbClient === undefined) {
      const msg = "dbClient config is not defined";
      this.logger.error(msg);
      throw new ValidationError(msg);
    }
    await this.dbClient("users").where({ id: userId }).del();
  }

  async placeUserBatchInTopic(users: User[]): Promise<string> {
    if (this.pubSubConfig === undefined) {
      const msg = "Pubsub config is not defined";
      this.logger.error(msg);
      throw new ValidationError(msg);
    }

    const params = {
      TopicArn: this.pubSubConfig.config.topicArn, // The queue URL from the environment variable
      Message: JSON.stringify({ users }),
    };

    try {
      const command = new PublishCommand(params);
      this.logger.debug("Message to send to Topic", { command });
      const result = await this.pubSubConfig.client.send(command);
      this.logger.info("Message sent to Topic", { result });
      return "Message sent successfully";
    } catch (error) {
      if (error instanceof Error) {
        const _error = new ApplicationError(error.message);
        this.logger.error(error.message, { error });
        throw _error;
      }
      const appError = new ApplicationError(
        `Error getting sending command to the topic`,
      );
      this.logger.error(appError.message, { error });
      throw appError;
    }
  }
}
