import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { Code, Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { addTags } from "./add-tags.util";
import { generateResourceName } from "./generatge-function-name.util";
import { EnvironmentVariable, Tag } from "./types";
import path = require("node:path");

/**
 * Create a NodeJS Lambda function with the provided name and source code.
 * @param scope to add the lambda function to.
 * @param params with the name and source code of the lambda function.
 * @example
 * nodeJSfn(this, {
 *  name: "getCMRulesLambda",
 *  sourceCode: "lib/task-count/lambdas/get-cm-rules",
 *  });
 */
export const nodeJSfn = (
  scope: Construct,
  params: {
    name: string;
    domain: string;
    lambdaFn: string;
    tags?: Tag;
    envs?: EnvironmentVariable;
    networking?: {
      vpc?: ec2.IVpc;
      securityGroups?: ec2.ISecurityGroup[];
    };
    timeout?: cdk.Duration;
    description?: string;
  },
): NodejsFunction => {
  const {
    name,
    domain,
    lambdaFn,
    tags = {},
    envs = {},
    networking = {},
    timeout,
    description = "",
  } = params;

  const pathToBuildFile = path.join(__dirname, "../../..", "build.mjs");

  // assuming the `handler` property is specified as 'index.handler' (as in this example), then
  // this 'build-output' directory must contain an index.js file with an exported `handler` function.
  const pathToOutputFile = path.join(
    __dirname,
    "../../..",
    "dist",
    domain,
    lambdaFn,
  );

  const commandThatIsRanDuringCdkSynth = [
    "node",
    pathToBuildFile,
    domain,
    lambdaFn,
  ];
  const code = Code.fromCustomCommand(
    pathToOutputFile,
    commandThatIsRanDuringCdkSynth,
  );

  const fn = new NodejsFunction(scope, name, {
    functionName: generateResourceName(name, envs.STAGE),
    description,
    runtime: Runtime.NODEJS_LATEST,
    handler: "index.handler",
    code,
    environment: {
      POWERTOOLS_LOG_LEVEL: "DEBUG",
      ...envs,
    },
    vpc: networking?.vpc,
    securityGroups: networking?.securityGroups,
    timeout,
  });

  addTags(fn, domain, { ...tags, ...(envs.STAGE && { STAGE: envs.STAGE }) });
  return fn;
};
