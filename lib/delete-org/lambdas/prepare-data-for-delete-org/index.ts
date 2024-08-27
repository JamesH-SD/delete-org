import { OrganizationService, UserType } from "@acivilate/org-delete-shared";
import {
  ApplicationError,
  DbService,
  ValidationError,
} from "@acivilate/shared-code";
import { Logger } from "@aws-lambda-powertools/logger";
import { SQSClient } from "@aws-sdk/client-sqs";
import { DocumentService } from "../shared/services/document.service";
import { InputEvent, OutputEvent } from "./io.type";

const logger = new Logger({
  serviceName: "delete-org",
});

const queue = {
  client: new SQSClient({}),
};

const countUsers = (users: any[], type: UserType) =>
  users.filter((u) => u.type === type).length;

export const handler = async (
  event: InputEvent,
  _context: unknown,
): Promise<OutputEvent> => {
  if (!event.leadAgencyId) {
    throw new ValidationError("lead agencyId is required");
  }
  logger.appendPersistentKeys({ leadAgencyId: event.leadAgencyId });

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

  const orgSvc = OrganizationService.getInstance({ logger, dbClient });
  const docSvc = DocumentService.getInstance({ logger, dbClient });
  try {
    const leadAgency = await orgSvc.getOrganization(event.leadAgencyId);
    const subAgencies = await orgSvc.getSubOrganizations(event.leadAgencyId);
    const users = await orgSvc.getOrganizationUsers(event.leadAgencyId);
    const documents = await docSvc.getDocumentsByOrganizationId(
      event.leadAgencyId,
    );

    const result = {
      leadAgency,
      subAgencies,
      totals: {
        users: {
          participants: countUsers(users, "participant"),
          professionals: countUsers(users, "professional"),
        },
        participantData: {
          documents: documents.length,
        },
        services: 0,
        subAgencies: subAgencies.length,
        facilities: 0,
      },
      allOrgIds: [
        { orgId: leadAgency.id },
        ...subAgencies.map((a) => ({ orgId: a.id })),
      ],
    };
    logger.info("result", { result });
    return result;
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error.message, error);
    }
    const appError = new ApplicationError("error in getting organization");
    logger.error(appError.message, { error });
    throw error;
  }
};
