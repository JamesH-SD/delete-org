import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { NodejsFunctionProps } from "aws-cdk-lib/aws-lambda-nodejs";
import { Queue } from "aws-cdk-lib/aws-sqs";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import {
  DOMAINS,
  EnvironmentVariable,
  LAMBDAS,
  NodeJSFn,
} from "../../shared/infra";

interface DeleteFilesFnProps extends NodejsFunctionProps {
  environment: EnvironmentVariable;
  queueArn: string;
  docsBucketName: string;
  docsTbBucketName: string;
}
export class DeleteFilesFn extends Construct {
  lambdaFn: NodeJSFn;
  constructor(scope: Construct, id: string, props: DeleteFilesFnProps) {
    super(scope, id);

    const filesToDeleteQueue = Queue.fromQueueArn(
      this,
      "FilesToDeleteQueue",
      props.queueArn,
    );

    const docsBucket = Bucket.fromBucketName(
      this,
      "DocsBucket",
      props.docsBucketName,
    );
    const docsTbBucket = Bucket.fromBucketName(
      this,
      "DocsTbBucket",
      props.docsTbBucketName,
    );

    this.lambdaFn = new NodeJSFn(this, id, {
      domain: DOMAINS.DELETE_ORG,
      lambdaFn: LAMBDAS.DELETE_ORG.DELETE_FILES,
      description: `Process files to delete for organization`,
      ...props,
      environment: {
        ...props.environment,
        QUEUE_URL: filesToDeleteQueue.queueUrl,
        DOCS_BUCKET_NAME: props.docsBucketName,
        DOCS_TB_BUCKET_NAME: props.docsTbBucketName,
      },
    });

    this.lambdaFn.addEventSource(
      new SqsEventSource(filesToDeleteQueue, {
        batchSize: 5,
      }),
    );

    filesToDeleteQueue.grantConsumeMessages(this.lambdaFn);
    docsBucket.grantDelete(this.lambdaFn);
    docsTbBucket.grantDelete(this.lambdaFn);
  }
}
