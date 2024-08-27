import { Logger } from "@aws-lambda-powertools/logger";
import knex, { Knex } from "knex";

/**
 * Database credentials for connecting to a database
 * @type {object} DbCredentials - Database credentials
 * @property host {string}- Database host
 * @property user {string} - Database user
 * @property password {string} - Database password
 * @property port {number} - Database port
 * @example
 * const dbCredentials = {
 *  host: "localhost",
 *  user: "user",
 *  password: "password",
 *  port: 3306,
 *  database: "mydb",
 * };
 */
export type DbCredentials = {
  host: string;
  user: string;
  password: string; // must be encrypted by KMS
  port: number;
  database: string;
};

/**
 * Constructor arguments for DbService
 * @property logger {Logger} - Logger instance
 * @property dbCredentials {DbCredentials} - Database credentials
 * @example
 * const dbCredentials = {
 *  host: "localhost",
 *  user: "user",
 *  password: "password",
 *  port: 3306,
 *  database: "mydb",
 * };
 * const dbService = new DbService({
 *  logger,
 *  dbCredentials,
 * });
 */
type ConstructorArgs = {
  logger: Logger;
  dbCredentials: DbCredentials;
};

/**
 * DbService class for creating a Knex client
 * @example
 * const dbCredentials = { host: "localhost",
 *  user: "user",
 *  password: "password",
 *  port: 3306,
 *  database: "mydb",
 * };
 * const dbService = new DbService({
 *  logger,
 *  dbCredentials,
 * });
 * const dbClient = await dbService.getDbClient();
 * const result = await dbClient.select().from("table");
 */
export class DbService {
  private readonly logger: Logger;
  private readonly dbCredentials: DbCredentials;
  private knexClient: Knex;
  static instance: DbService | null = null;

  /**
   * Constructor for DbService
   * @param logger - Logger instance
   * @param dbCredentials - Database credentials
   * @example
   * const dbCredentials = { host: "localhost",
   *  user: "user",
   *  password: "password",
   *  port: 3306,
   *  database: "mydb",
   * };
   * const dbService = new DbService({
   *  logger,
   *  dbCredentials,
   * });
   * const dbClient = await dbService.getDbClient();
   * const result = await dbClient.select().from("table");
   */
  constructor({ logger, dbCredentials }: ConstructorArgs) {
    this.logger = logger;
    this.dbCredentials = dbCredentials;
  }

  /**
   * Get a singleton instance of the DbService
   * @param logger {Logger} - Logger instance
   * @param dbCredentials {DbCredentials} - Database credentials
   * @returns DbService instance
   * @example
   * const dbService = DbService.getInstance({
   *  logger,
   *  dbCredentials,
   * });
   * const dbClient = await dbService.getDbClient();
   * const result = await dbClient.select().from("table");
   */
  static getInstance({ logger, dbCredentials }: ConstructorArgs): DbService {
    if (!DbService.instance) {
      DbService.instance = new DbService({ logger, dbCredentials });
    }
    return DbService.instance;
  }

  /**
   * Get a Knex configuration object
   * @param dbCredentials - Database credentials
   * @returns Knex configuration object
   * @example
   * const dbCredentials = {
   *  host: "localhost",
   *  username: "user",
   *  password: "password",
   *  port: 3306,
   *  dbname: "mydb",
   *  };
   *  const knexConfig = DbService.getConfig(dbCredentials);
   */
  static getConfig: (dbCredentials: DbCredentials) => Knex.Config = (
    dbCredentials: DbCredentials,
  ): Knex.Config => {
    return {
      client: "mysql2",
      connection: {
        ...dbCredentials,
      },
    };
  };

  /**
   * Get a Knex client from the cache or
   * create a new one if it does not exist
   * @returns Knex client
   * @example
   * const dbClient = await dbService.getDbClient();
   * const result = await dbClient.select().from("table");
   */
  getDbClient(): Knex {
    this.logger.debug("Getting db client from the cache");
    if (!this.knexClient) {
      this.logger.debug(
        "knex client not found in the cache, creating a new one",
      );
      const knexConfig = DbService.getConfig(this.dbCredentials);
      this.logger.debug("knex config", {
        knexConfig,
      });
      this.knexClient = knex(knexConfig);
      this.logger.debug("knex client created", { knexClient: this.knexClient });
    }
    return this.knexClient;
  }
}
