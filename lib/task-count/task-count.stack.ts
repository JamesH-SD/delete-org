import * as cdk from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
import {
  LAMBDAS,
  STAGE,
  generateResourceName,
  nodeJSfn,
} from "../shared/infra";

/**
 * TaskCountStack
 * @param scope
 * @param id
 * @param props
 * @example
 * new TaskCountStack(app, "TaskCountStack");
 * new TaskCountStack(app, "TaskCountStack", { env: { account: "123456789012", region: "us-east-1" } });
 */
export class TaskCountStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const envs = { STAGE: STAGE.DEV };
    const getCMRulesLambda = nodeJSfn(this, {
      name: generateResourceName(LAMBDAS.TASK_COUNT.GET_CM_RULES, envs.STAGE),
      domain: LAMBDAS.TASK_COUNT.DOMAIN,
      lambdaFn: LAMBDAS.TASK_COUNT.GET_CM_RULES,
      envs,
    });

    // Create a policy statement that grants ListRules permission
    const listRulesPolicy = new iam.PolicyStatement({
      actions: ["events:ListRules"],
      resources: ["*"], // Adjust the resource ARN if needed
    });

    // Attach the policy to the Lambda function's role
    getCMRulesLambda.addToRolePolicy(listRulesPolicy);
  }
}
