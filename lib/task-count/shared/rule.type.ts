import { Rule } from "@aws-sdk/client-cloudwatch-events";
import { CaseManager } from "./case-manger.type";

/**
 * Rules type
 * @extends RuleType
 * @extends CaseManager
 * @example
 * const rules: RulesType = {
 *    countOfRules: 1,
 *    countOfCaseManagers: 1,
 *    rules: [
 *    {
 *        id: "rule1",
 *        name: "rule1",
 *        caseManager: {
 *          id: "cm1",
 *          name: "cm1",
 *        },
 *    }
 *   ],
 * };
 */
export type RulesType = {
  countOfRules: number;
  countOfCaseManagers: number;
  rules: RuleType[];
};

/**
 * Rule type
 * @extends Rule
 * @extends Case
 * @example
 * const rule: RuleType = {
 *  id: "rule1",
 *  name: "rule1",
 *  caseManager: {
 *  id: "cm1",
 *  name: "cm1",
 * },
 *};
 */
export type RuleType = Rule & { caseManager: CaseManager };
