#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
// import { TaskCountStack } from "../lib/task-count/task-count.stack";
import { DeleteOrgStack } from "../lib/delete-org/delete-org.stack";
import { DOMAINS, SharedResourcesStack } from "../lib/shared/infra";

const app = new cdk.App();
const sharedResourceStack = new SharedResourcesStack(
  app,
  "SharedResourceStack",
  {
    stackName: DOMAINS.SHARED_RESOURCES,
    description: `Utilities: deploy shared resources for the mypokket-utitls
such as AppConfig, SSM, Secrets and Others.`,
    tags: {
      app: "mypokket-utils",
      domain: DOMAINS.SHARED_RESOURCES,
    },
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT || "798386916416",
      region: process.env.CDK_DEFAULT_REGION || "us-east-1",
    },
  },
);

// new TaskCountStack(app, "TaskCountStack", {
//   /* If you don't specify 'env', this stack will be environment-agnostic.
//    * Account/Region-dependent features and context lookups will not work,
//    * but a single synthesized template can be deployed anywhere. */
//   /* Uncomment the next line to specialize this stack for the AWS Account
//    * and Region that are implied by the current CLI configuration. */
//   // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
//   /* Uncomment the next line if you know exactly what Account and Region you
//    * want to deploy the stack to. */
//   // env: { account: '123456789012', region: 'us-east-1' },
//   /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
// });
const deleteOrgStack = new DeleteOrgStack(app, "DeleteOrgStack", {
  stackName: DOMAINS.DELETE_ORG,
  description: `Utilities: create all the resources needed to delete an
oranigazation from mypokket. Include data from the relational database,
file storage and no-sql databases`,
  tags: {
    app: "mypokket-utils",
    domain: DOMAINS.DELETE_ORG,
  },
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT || "798386916416",
    region: process.env.CDK_DEFAULT_REGION || "us-east-1",
  },
});
