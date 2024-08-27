import { Rule } from "@aws-sdk/client-cloudwatch-events";
import { Stage, Result, err, ok } from "../../../shared/code";

/**
 * Rule type
 */
export type RuleName = {
  stage: Stage;
  perfix: string;
  cmId: string;
  raw: string;
};

/**
 * Rule with decomposed name
 * @extends Rule
 * @property decomposedName - Decomposed rule name
 * @example
 * const rule: RuleWithDecomposedName = { Name: "mypokket-calc-task-counts-cm1-dev", decomposedName: { stage: "dev", cmId: "cm1", perfix: "mypokket-calc-task-counts", raw: "mypokket-calc-task-counts-cm1-dev" } }
 */
export type RuleWithDecomposedName = Rule & { decomposedName: RuleName };

/**
 * Decompose rule name into its parts
 * @param ruleName - Rule name to decompose
 * @returns Rule name parts
 * @example
 * const rule = decomposeRuleName("mypokket-calc-task-counts-cm1-dev");
 * // rule: { stage: "dev", cmId: "cm1", perfix: "mypokket-calc-task-counts", raw: "mypokket-calc-task-counts-cm1-dev" }
 * @throws
 * Rule name is required
 * Invalid rule name: nohyphenshere it required 5 parts
 */
export const decomposeRuleName = (
  ruleName: string,
): Result<RuleName, string> => {
  if (ruleName === "" || ruleName.length === 0) {
    return err("Rule name is required");
  }
  // mypokket-calc-task-counts-1xzgl4Qioy-dev
  const splited = ruleName.split("-");

  if (splited.length < 5) {
    return err(`Invalid rule name: ${ruleName} it required 5 parts`);
  }

  return ok({
    stage: (splited[splited.length - 1] as Stage) || "dev",
    cmId: splited[4] || "n/a",
    perfix: splited.slice(0, splited.length - 2).join("-") || "n/a",
    raw: ruleName,
  });
};
