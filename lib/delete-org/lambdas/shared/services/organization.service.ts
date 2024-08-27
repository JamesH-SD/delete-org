import { Logger } from "@aws-lambda-powertools/logger";
import { Organization, OrganizationId, User } from "../types";
import { ApplicationError, DatabaseError } from "@acivilate/shared-code";
import { Knex } from "knex";

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
  dbClient: Knex;
};

/**
 * OrganizationService class to handle organization
 * @example
 * const orgService = OrganizationService.getInstance({ logger, dbClient });
 * const orgResult = await orgService.getOrganization(orgId);
 * orgService.deleteOrganization(orgId);
 */
export class OrganizationService {
  private readonly logger: Logger;
  private readonly dbClient: Knex;
  static instance: OrganizationService | null = null;

  /**
   * Constructor
   * @param logger {Logger} - Logger instance
   * @param dbClient { Knex } - Knex instance
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
  constructor({ logger, dbClient }: ConstructorArgs) {
    this.logger = logger;
    this.dbClient = dbClient;
  }

  /**
   * Get the OrganizationService instance
   * @param logger {Logger} - Logger instance
   * @param dbClient {Knex} - Knex instance
   * @example
   * const orgService = OrganizationService.getInstance({ logger, dbClient });
   * const orgResult = await orgService.getOrganization(orgId);
   */
  static getInstance({
    logger,
    dbClient,
  }: ConstructorArgs): OrganizationService {
    if (!OrganizationService.instance) {
      OrganizationService.instance = new OrganizationService({
        logger,
        dbClient,
      });
    }
    return OrganizationService.instance;
  }

  /**
   * Get an organization by its id
   * @param orgId {OrganizationId}- organization id
   * @returns Organization instance or error
   * @throws ApplicationError
   * @example
   * const orgResult = await orgService.getOrganization(orgId);
   */
  async getOrganization(orgId: OrganizationId): Promise<Organization> {
    this.logger.info(`Getting organization with id: ${orgId}`);
    this.logger.debug("dbClient", { dbClient: this.dbClient });
    // Get organization from database
    try {
      const org: Organization = await this.dbClient
        .select(
          "organization_id as id",
          "organization_name as name",
          "lft as left",
          "rgt as right",
          "contract_id as contractId",
        )
        .from("organization")
        .where({ organization_id: orgId })
        .first();
      this.logger.appendPersistentKeys({
        organizationName: org.name,
      });
      return org;
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

  /**
   * Get users of an organization
   * @param orgId {OrganizationId} - organization id
   * @returns User[] - list of users
   * @throws ApplicationError
   * @example
   * const users = await orgService.getOrganizationUsers(orgId);
   * console.log(users);
   * // [ { id: 1, name: 'user1', left: 1, right: 2, contractId: 1 } ]
   */
  async getOrganizationUsers(orgId: OrganizationId): Promise<User[]> {
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

  async getSubOrganizations(orgId: OrganizationId): Promise<Organization[]> {
    this.logger.info(
      `Getting sub organizations for organization with id: ${orgId}`,
    );
    this.logger.debug("dbClient", { dbClient: this.dbClient });
    // Get organization from database
    try {
      const org = await this.getOrganization(orgId);
      const orgs: Organization[] = await this.dbClient
        .select(
          "organization_id as id",
          "organization_name as name",
          "lft as left",
          "rgt as right",
          "contract_id as contractId",
        )
        .from("organization")
        .whereBetween("lft", [org.left + 1, org.right]);
      this.logger.debug("getSubOrganizations sample of 10", {
        orgs: orgs.slice(0, 10),
      });
      return orgs;
    } catch (error) {
      if (error instanceof Error) {
        const dbError = new DatabaseError(error.message);
        this.logger.error(error.message, { error });
        throw dbError;
      }
      const appError = new ApplicationError(
        `Error getting sub organizations for organization with id: ${orgId}`,
      );
      this.logger.error(appError.message, {
        error,
      });
      throw appError;
    }
  }

  /**
   * Delete an organization
   * @param orgId {OrganizationId} - lead agency id
   * @returns void
   * @example
   * await orgService.deleteOrganization(orgId);
   */
  async deleteOrganization(orgId: OrganizationId): Promise<void> {
    this.logger.info(`Deleting organization with id: ${orgId}`);
    // Delete organization from database
  }
}
