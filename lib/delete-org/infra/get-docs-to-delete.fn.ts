import { Duration } from "aws-cdk-lib";
import { NodejsFunctionProps } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import {
  DOMAINS,
  EnvironmentVariable,
  LAMBDAS,
  NodeJSFn,
  Queue,
} from "../../shared/infra";

interface GetDocsToDeleteFnProps extends NodejsFunctionProps {
  environment: EnvironmentVariable;
}
export class GetDocsToDeleteFn extends Construct {
  lambdaFn: NodeJSFn;
  queueArn: string;
  constructor(scope: Construct, id: string, props: GetDocsToDeleteFnProps) {
    super(scope, id);

    const filesToDeleteQueue = new Queue(this, "FilesToDeleteQueue", {
      domain: DOMAINS.DELETE_ORG,
      environment: props.environment,
      visibilityTimeout: Duration.seconds(600),
      retentionPeriod: Duration.days(3),
    });

    this.lambdaFn = new NodeJSFn(this, id, {
      domain: DOMAINS.DELETE_ORG,
      lambdaFn: LAMBDAS.DELETE_ORG.GET_DOCS_TO_DELETE,
      description: `Get all the documents that need to be deleted for the org`,
      ...props,
      environment: {
        ...props.environment,
        QUEUE_URL: filesToDeleteQueue.queueUrl,
      },
    });

    filesToDeleteQueue.grantSendMessages(this.lambdaFn);
    this.queueArn = filesToDeleteQueue.queueArn;
  }
}
