import { Construct } from "constructs";
import { DOMAINS, STAGE } from "../shared/infra";
import { DeleteOrgSfn } from "./infra";
import { Stack, CfnParameter, StackProps } from "aws-cdk-lib";
import { SecurityGroup, Vpc } from "aws-cdk-lib/aws-ec2";

/**
 * DeleteOrgStack
 * @param scope
 * @param id
 * @param props
 * @example
 * new DeleteOrgStack(app, "DeleteOrgStack");
 * new DeleteOrgStack(app, "DeleteOrgStack", { env: { account: "123456789012", region: "us-east-1" } });
 */
export class DeleteOrgStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const stageParam = new CfnParameter(this, "stage", {
      type: "String",
      description: "stage or environment to deploy",
      allowedValues: [STAGE.DEV, STAGE.PROD, STAGE.TRAIN, STAGE.DEMO],
      default: STAGE.DEV,
    });

    const logLevel = this.node.tryGetContext("logLevel") as string;
    const envs = {
      STAGE: stageParam.valueAsString as STAGE,
      POWERTOOLS_LOG_LEVEL: logLevel?.toUpperCase() || "INFO",
    };

    const vpcId = this.node.tryGetContext("vpcId") as string;
    const vpc = Vpc.fromLookup(this, "ExistingVPC", {
      vpcId: vpcId,
    });

    const sgId = this.node.tryGetContext("sgId") as string;
    const securityGroup = SecurityGroup.fromSecurityGroupId(
      this,
      "ExistingSecurityGroupg",
      sgId,
    );

    const docsBucketNameParam = new CfnParameter(this, "docsBucketName", {
      type: "String",
      description: "stage or environment to deploy",
      default: "",
    });

    const docsTbBucketNameParam = new CfnParameter(this, "docsTbBucketName", {
      type: "String",
      description: "stage or environment to deploy",
      default: "",
    });

    new DeleteOrgSfn(this, DOMAINS.DELETE_ORG, {
      vpc,
      securityGroup,
      environment: envs,
      docsBucketName: docsBucketNameParam.valueAsString,
      docsTbBucketName: docsTbBucketNameParam.valueAsString,
    });
  }
}
