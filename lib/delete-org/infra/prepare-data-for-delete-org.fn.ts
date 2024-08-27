import { ISecurityGroup, IVpc } from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";
import {
  DOMAINS,
  EnvironmentVariable,
  LAMBDAS,
  NodeJSFn,
} from "../../shared/infra";
import { NodejsFunctionProps } from "aws-cdk-lib/aws-lambda-nodejs";

interface PrepareDataForDeleteOrgProps extends NodejsFunctionProps {
  environment: EnvironmentVariable;
}
export class PrepareDataForDeleteOrgFn extends Construct {
  lambdaFn: NodeJSFn;
  constructor(
    scope: Construct,
    id: string,
    props: PrepareDataForDeleteOrgProps,
  ) {
    super(scope, id);

    this.lambdaFn = new NodeJSFn(this, id, {
      domain: DOMAINS.DELETE_ORG,
      lambdaFn: LAMBDAS.DELETE_ORG.PREPARE_DATA_FOR_DELETE_ORG,
      description: `Prepare data for delete org and place them in the right
    queue to be process by the next lambda`,
      ...props,
    });
  }
}
