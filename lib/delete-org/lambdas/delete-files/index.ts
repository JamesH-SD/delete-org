import {
  DocumentService,
  FlattenedDocumentUser,
} from "@acivilate/org-delete-shared";
import { ApplicationError, chunkArray } from "@acivilate/shared-code";
import { Logger } from "@aws-lambda-powertools/logger";
import { S3Client } from "@aws-sdk/client-s3";
import { Context, SQSEvent, SQSRecord } from "aws-lambda";
import { InputEvent } from "./io.type";

const logger = new Logger({
  serviceName: "delete-org",
});

const fileStorageClient = new S3Client({});

// Function to process each record
const processRecord = async (
  logger: Logger,
  docSvc: DocumentService,
  record: SQSRecord,
): Promise<void> => {
  // If the message body contains JSON, you can parse it
  const parsedBody = JSON.parse(record.body);
  const documentGroups = parsedBody.message as InputEvent;

  if (!documentGroups || !documentGroups.length) {
    logger.info("No documents to delete");
    return;
  }

  logger.info("Deleting documents; sample of 10", {
    documents: documentGroups.length,
    documentGroups: documentGroups.slice(0, 10),
  });

  const flattenedArray: FlattenedDocumentUser[] = documentGroups.flatMap(
    (record) =>
      record.documents.map((document) => ({
        user: record.user,
        document: document,
      })),
  );

  const documentChunks = chunkArray(flattenedArray, 200);
  logger.info("Document chunks", { documentChunks: documentChunks.length });

  // Use Promise.all to process chunks in parallel
  await Promise.all(
    documentChunks.map((chunk, i) => {
      logger.info(
        `Processing chunk ${i + 1} of ${documentChunks.length} of ${chunk.length} items`,
      );
      return docSvc.deleteFiles(chunk);
    }),
  );

  // for (const documentGroup of documentGroups) {
  //   logger.appendKeys({ processingUser: documentGroup.user });
  //   logger.info("Deleting document for user");
  //   await docSvc.deleteFiles(documentGroup.documents);
  // }
};

export const handler = async (event: SQSEvent, _contex: Context) => {
  // comes from aws app config / secrets manager

  const docSvc = DocumentService.getInstance({
    logger,
    fileStorage: {
      config: {
        docsBucketName: process.env.DOCS_BUCKET_NAME || "",
        docsTbBucketName: process.env.DOCS_TB_BUCKET_NAME || "",
      },
      client: fileStorageClient,
    },
  });

  // Loop through each record (message) in the SQS event
  try {
    for (const record of event.Records) {
      logger.appendKeys({
        messageId: record.messageId,
        receiptHandle: record.receiptHandle,
      });
      await processRecord(logger, docSvc, record);
      logger.resetKeys();
    }
    return { message: "files deleted" };
  } catch (error) {
    if (error instanceof Error) {
      const _error = new ApplicationError(error.message);
      logger.error(error.message, { error });
      throw _error;
    }
    const appError = new ApplicationError(
      `Error getting sending command to the S3`,
    );
    logger.error(appError.message, { error });
    throw appError;
  }
};
