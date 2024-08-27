import { Logger } from "@aws-lambda-powertools/logger";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { DeleteObjectsCommand, S3Client } from "@aws-sdk/client-s3";
import { Knex } from "knex";
import {
  Document,
  DocumentGroup,
  DocumentWithoutUser,
  FlattenedDocumentUser,
  GroupedDocuments,
  User,
} from "../types";
import {
  DatabaseError,
  ApplicationError,
  ValidationError,
} from "@acivilate/shared-code";

type QueueConfig = {
  config: { url: string };
  client: SQSClient;
};
type FileStorageConfig = {
  client: S3Client;
  config: {
    docsBucketName: string;
    docsTbBucketName: string;
  };
};
/**
 * Constructor type
 * @property logger {Logger} - Logger instance
 * @property dbClient {Knex} - Knex instance
 * @example
 * const logger = new Logger({
 *  serviceName: "my-service",
 * });
 * const dbClient = knex({
 *   client: "mysql2",
 *   connection: {
 *   host: "localhost",
 *   user: "user",
 *   password: "password",
 *   database: "mydb",
 *  },
 * });
 * const orgService = new OrganizationService({ logger, dbClient });
 */
type ConstructorArgs = {
  logger: Logger;
  dbClient?: Knex;
  queue?: QueueConfig;
  fileStorage?: FileStorageConfig;
};

export class DocumentService {
  private readonly logger: Logger;
  private readonly dbClient: Knex | undefined;
  private readonly queue: QueueConfig | undefined;
  private readonly fileStorage: FileStorageConfig | undefined;
  static instance: DocumentService | null = null;

  constructor({ logger, dbClient, queue, fileStorage }: ConstructorArgs) {
    this.logger = logger;
    this.dbClient = dbClient;
    this.queue = queue;
    this.fileStorage = fileStorage;
  }
  static getInstance({
    logger,
    dbClient,
    queue,
    fileStorage,
  }: ConstructorArgs): DocumentService {
    if (!DocumentService.instance) {
      DocumentService.instance = new DocumentService({
        logger,
        dbClient,
        queue,
        fileStorage,
      });
    }
    return DocumentService.instance;
  }

  async getDocumentsByUserId(pokketUserId: string): Promise<Document[]> {
    if (this.dbClient === undefined) {
      const msg = "dbClient config is not defined";
      this.logger.error(msg);
      throw new ValidationError(msg);
    }

    this.logger.info(`Getting document for pokketUserId : ${pokketUserId}`);
    this.logger.debug("dbClient", { dbClient: this.dbClient });
    try {
      const docsFromDb = await this.dbClient
        .select([
          "pu.pokket_user_id as pokketUserId",
          "pu.user_name as username",
          "pu.ssn as agencyId",
          "d.document_id as docummentId",
          "d.document_name as documentName",
          "d.document_url as documentUrl",
        ])
        .from("document as d")
        .innerJoin(
          "pokket_user_document as pud",
          "pud.document_id",
          "d.document_id",
        )
        .innerJoin(
          "pokket_user as pu",
          "pu.pokket_user_id",
          "pud.pokket_user_id",
        )
        .where("pud.pokket_user_id", pokketUserId);

      const docs = docsFromDb.map(
        ({
          pokketUserId,
          username,
          agencyId,
          documentId,
          documentName,
          documentUrl,
        }: {
          pokketUserId: string;
          username: string;
          agencyId: string;
          documentId: string;
          documentName: string;
          documentUrl: string;
        }) => {
          const user: User = {
            id: pokketUserId,
            type: "participant",
            username,
            agencyId,
          };
          return {
            id: documentId,
            name: documentName,
            url: documentUrl,
            user,
          };
        },
      );
      this.logger.debug("getDocumentsByUserId sample of 10", {
        documents: docs.slice(0, 10),
      });
      return docs || [];
    } catch (error) {
      if (error instanceof Error) {
        const dbError = new DatabaseError(error.message);
        this.logger.error(error.message, { error });
        throw dbError;
      }
      const appError = new ApplicationError(
        `Error getting document for pokketUserId: ${pokketUserId}`,
      );
      this.logger.error(appError.message, {
        error,
      });
      throw appError;
    }
  }

  async getDocumentsByOrganizationId(orgId: string): Promise<Document[]> {
    if (this.dbClient === undefined) {
      const msg = "dbClient config is not defined";
      this.logger.error(msg);
      throw new ValidationError(msg);
    }

    this.logger.info(`Getting document for pokketUserId : ${orgId}`);
    this.logger.debug("dbClient", { dbClient: this.dbClient });
    try {
      const docsFromDb = await this.dbClient
        .select([
          "pu.pokket_user_id as pokketUserId",
          "pu.user_name as username",
          "pu.ssn as agencyId",
          "d.document_id as documentId",
          "d.document_name as documentName",
          "d.document_url as documentUrl",
        ])
        .from("document as d")
        .innerJoin(
          "pokket_user_document as pud",
          "pud.document_id",
          "d.document_id",
        )
        .innerJoin(
          "pokket_user as pu",
          "pu.pokket_user_id",
          "pud.pokket_user_id",
        )
        .innerJoin("participant as p", "pu.pokket_user_id", "p.pokket_user_id")
        .innerJoin("organization as o", "p.contract_id", "o.contract_id")
        .where("o.organization_id", orgId);

      const docs = docsFromDb.map(
        ({
          pokketUserId,
          username,
          agencyId,
          documentId,
          documentName,
          documentUrl,
        }: {
          pokketUserId: string;
          username: string;
          agencyId: string;
          documentId: string;
          documentName: string;
          documentUrl: string;
        }) => {
          const user: User = {
            id: pokketUserId,
            type: "participant",
            username,
            agencyId,
          };
          return {
            id: documentId,
            name: documentName,
            url: documentUrl,
            user,
          };
        },
      );
      this.logger.debug("getDocumentsByOrgId sample of 10", {
        documents: docs.slice(0, 10),
      });
      return docs || [];
    } catch (error) {
      if (error instanceof Error) {
        const dbError = new DatabaseError(error.message);
        this.logger.error(error.message, { error });
        throw dbError;
      }
      const appError = new ApplicationError(
        `Error getting organization with id: ${orgId}`,
      );
      this.logger.error(appError.message, {
        error,
      });
      throw appError;
    }
  }

  groupDocumentsByUserId(documents: Document[]): GroupedDocuments {
    this.logger.info("Grouping documents by userId");
    const groupedByUser = documents.reduce<GroupedDocuments>(
      (acc, document) => {
        // this.logger.debug("groupDocumentsByUserId", { document });
        const { user, ...doc } = document;
        const userId = user.id;
        if (!acc[userId]) {
          acc[userId] = {
            user: document.user,
            documents: [],
          };
        }

        acc[userId].documents.push(doc);

        return acc;
      },
      {},
    );
    const sampleOf10 = Object.keys(groupedByUser)
      .slice(0, 10)
      .map((key) => groupedByUser[key]);
    this.logger.debug("groupDocumentsByUserId sample of 10", {
      users: sampleOf10,
    });

    return groupedByUser;
  }

  async placeDocsInQueue(
    groupedByUser: DocumentGroup | unknown,
  ): Promise<string> {
    if (this.queue === undefined) {
      const msg = "Queue config is not defined";
      this.logger.error(msg);
      throw new ValidationError(msg);
    }

    const params = {
      QueueUrl: this.queue.config.url, // The queue URL from the environment variable
      MessageBody: JSON.stringify({
        message: groupedByUser,
        timestamp: new Date().toISOString(),
      }),
    };

    try {
      const command = new SendMessageCommand(params);
      this.logger.debug("Message to send to Queue", { command });
      const result = await this.queue.client.send(command);
      this.logger.info("Message sent to Queue", { result });
      return "Message sent successfully";
    } catch (error) {
      if (error instanceof Error) {
        const _error = new ApplicationError(error.message);
        this.logger.error(error.message, { error });
        throw _error;
      }
      const appError = new ApplicationError(
        `Error getting sending command to the queue`,
      );
      this.logger.error(appError.message, { error }, { groupedByUser });
      throw appError;
    }
  }

  async deleteFiles(documents: FlattenedDocumentUser[]): Promise<string> {
    if (this.fileStorage === undefined) {
      const msg = "File storage config is not defined";
      this.logger.error(msg);
      throw new ValidationError(msg);
    }
    // const docUrls = documents.map(
    //   (doc: DocumentWithoutUser): string => doc.url,
    // );
    this.logger.info(`Deleting files; sample of 10`, {
      documentUrls: documents.slice(0, 10),
    });
    try {
      const deleteParams = {
        Bucket: this.fileStorage?.config.docsBucketName,
        Delete: {
          Objects: documents.map((doc) => ({
            Key: doc.document.url,
          })),
          Quiet: false,
        },
      };

      const command = new DeleteObjectsCommand(deleteParams);
      this.logger.debug("Message to send to FileStorage", { command });
      const result = await this.fileStorage?.client.send(command);
      this.logger.info("Message sent to Queue", { result });

      return "File deleted successfully";
    } catch (error) {
      if (error instanceof Error) {
        const _error = new ApplicationError(error.message);
        this.logger.error(error.message, { error });
        throw _error;
      }
      const appError = new ApplicationError(
        `Error getting sending command to the queue`,
      );
      this.logger.error(appError.message, { error }, { documents });
      throw appError;
    }
  }
}
