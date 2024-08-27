import { CloudWatchEventsClient } from "@aws-sdk/client-cloudwatch-events";
import { Logger } from "@aws-lambda-powertools/logger";
import { getStageFromEnv } from "../../../shared/code";
import { RuleService } from "../../shared";

const logger = new Logger({ serviceName: "get-cm-rules" });
const client = new CloudWatchEventsClient();

export const handler = async (
  _event: unknown,
  _context: unknown,
): Promise<unknown> => {
  logger.debug("getting stage from environment");
  const stage = getStageFromEnv();
  logger.debug("stage from environment", stage);
  logger.debug("intializing rule service", { client, stage });
  const ruleService = new RuleService(logger, client, stage);
  logger.debug("about to get rules");
  const rules = await ruleService.getRules();
  if (rules.type === "ok") {
    return {
      statusCode: 200,
      body: JSON.stringify(rules.value),
    };
  } else {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error getting rules",
      }),
    };
  }
};
