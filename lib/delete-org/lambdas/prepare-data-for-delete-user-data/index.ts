import { DbService, ValidationError, chunkArray } from "@acivilate/shared-code";
import { Logger } from "@aws-lambda-powertools/logger";
import { SNSClient } from "@aws-sdk/client-sns";
import { Context } from "aws-lambda";
import { UserService } from "../shared/services/user.service";
import { InputEvent, OutputEvent } from "./io.type";

const logger = new Logger({
  serviceName: "delete-org",
});

const snsClient = new SNSClient({});

export const handler = async (
  event: InputEvent,
  _context: Context,
): Promise<OutputEvent> => {
  if (!event.orgId) {
    throw new ValidationError("organization id is required");
  }
  logger.appendPersistentKeys({ processingOrgId: event.orgId });

  // comes from aws app config / secrets manager
  const dbCredentials = {
    password: "umPsNzOOzJX1I98TO0pmU9pn3cn6LR",
    database: "mypokket",
    port: 3306,
    host: "prod-nc-1.cqfen9pp9x9x.us-gov-west-1.rds.amazonaws.com",
    user: "mypokketdbuser",
  };
  const dbService = DbService.getInstance({
    logger,
    dbCredentials,
  });
  const dbClient = dbService.getDbClient();
  logger.info("dbClient from lambda", { dbClient });

  const userSvc = UserService.getInstance({
    logger,
    dbClient,
    pubSubConfig: {
      config: {
        topicArn: process.env.TOPIC_ARN || "",
      },
      client: snsClient,
    },
  });
  const users = await userSvc.getUsersByOrganizationId(event.orgId);

  const userChunks = chunkArray(users, 500);
  logger.info("Users chunks", { documentChunks: userChunks.length });

  // Use Promise.all to process chunks in parallel
  await Promise.all(
    userChunks.map((chunk, i) => {
      logger.info(
        `Processing chunk ${i + 1} of ${userChunks.length} of ${chunk.length} items`,
      );
      return userSvc.placeUserBatchInTopic(chunk);
    }),
  );

  return {};
};
