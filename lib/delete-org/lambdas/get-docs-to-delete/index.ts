import {
  ApplicationError,
  DatabaseError,
  DbService,
  ValidationError,
  chunkArray,
} from "@acivilate/shared-code";
import { Logger } from "@aws-lambda-powertools/logger";
import { SQSClient } from "@aws-sdk/client-sqs";
import type { Context } from "aws-lambda";
import { DocumentService } from "../shared/services";
import { InputEvent } from "./io.type";

const logger = new Logger({
  serviceName: "delete-org",
});
const queueClient = new SQSClient({});

export const handler = async (
  event: InputEvent,
  _context: Context,
): Promise<unknown> => {
  if (!event.orgId) {
    throw new ValidationError("orgId  is required");
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

  const docSvc = DocumentService.getInstance({
    logger,
    dbClient,
    queue: {
      config: { url: process.env.QUEUE_URL || "" },
      client: queueClient,
    },
  });
  try {
    const documents = await docSvc.getDocumentsByOrganizationId(event.orgId);
    const totalDocs = documents.length;

    const groupedDocs = docSvc.groupDocumentsByUserId(documents);
    const totalUsers = Object.keys(groupedDocs).length;

    const documentChunks = chunkArray(Object.values(groupedDocs), 500);
    logger.info("Document chunks", { documentChunks: documentChunks.length });

    // Use Promise.all to process chunks in parallel
    await Promise.all(
      documentChunks.map((chunk, i) => {
        logger.info(
          `Processing chunk ${i + 1} of ${documentChunks.length} of ${chunk.length} items`,
        );
        return docSvc.placeDocsInQueue(chunk);
      }),
    );

    return { message: "Documents placed in queue", totalDocs, totalUsers };
  } catch (error) {
    if (error instanceof Error) {
      const dbError = new DatabaseError(error.message);
      logger.error(error.message, { error });
      throw dbError;
    }
    const appError = new ApplicationError(
      `Error getting processing files for organization with id: ${event.orgId}`,
    );
    logger.error(appError.message, {
      error,
    });
    throw appError;
  }
};
