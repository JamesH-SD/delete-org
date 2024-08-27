import {
  CloudWatchEventsClient,
  ListRulesCommand,
  Rule,
} from "@aws-sdk/client-cloudwatch-events";
import { Logger } from "@aws-lambda-powertools/logger";
import { RuleType, RulesType } from "./rule.type";
import {
  RuleWithDecomposedName,
  decomposeRuleName,
} from "../lambdas/get-cm-rules/shared";
import { Result, err, ok, Stage } from "../../shared/code";

/**
 * Service to manage rules from CloudWatch Events
 * @param logger - Logger from Lambda Powertools
 * @param client - CloudWatchEventsClient from AWS SDK
 * @returns RulesService instance
 * @example
 * const ruleService = new RulesService(logger, client);
 * const rules = await ruleService.getRules();
 */
export class RuleService {
  constructor(
    private readonly logger: Logger,
    private readonly client: CloudWatchEventsClient,
    private readonly stage: Stage = "dev",
  ) {}

  /**
   * Process AWS Cloudwatch Rules and convert it RuleType
   * @param rules - List of rules
   * @returns List of processed rules
   * @throws Error decomposing rule name
   * @throws Error filtering rules
   */
  private processRules(rules: Rule[]): RuleType[] {
    return (
      rules
        .map((rule: Rule): RuleWithDecomposedName => {
          const decomposedName = decomposeRuleName(rule.Name || "");
          if (decomposedName.type === "err") {
            this.logger.error(decomposedName.error, { rule: rule });
            return {} as RuleWithDecomposedName;
          } else {
            return {
              ...rule,
              decomposedName: decomposedName.value,
            };
          }
        })
        .filter((rule: RuleWithDecomposedName): boolean => {
          return rule.decomposedName.stage
            .toLowerCase()
            .includes(this.stage.toLowerCase());
        })
        .map((rule: RuleWithDecomposedName): RuleType => {
          const { decomposedName, ...rest } = rule;
          return {
            ...rest,
            caseManager: {
              id: decomposedName.cmId || "n/a",
              name: "n/a",
            },
          };
        }) || []
    );
  }
  /**
   * Get rules from CloudWatch Events service
   * @returns List of rules
   * @example
   * const rules = await ruleService.getRules();
   * // rules: [{ Name: "rule1" }, { Name: "rule2" }]
   * @throws Error getting rules
   * @throws Error decomposing rule name
   * @throws Error filtering rules
   * @throws Error processing rules
   * @throws Error getting case manager name
   */
  async getRules(): Promise<Result<RulesType, string>> {
    try {
      this.logger.info("Getting rules");
      const data = await this.client.send(
        new ListRulesCommand({
          NamePrefix: "mypokket-calc-task-counts",
        }),
      );
      this.logger.info("Got rules", { rules: data.Rules });

      const processesRules = this.processRules(data.Rules || []);

      const rules: RulesType = {
        countOfRules: processesRules?.length || 0,
        countOfCaseManagers: 0,
        rules: processesRules,
      };
      this.logger.info("Rules processed", { rules: rules });

      return ok(rules);
    } catch (error) {
      this.logger.error("Error", { error });
      return err("Error getting rules");
    }
  }
}
