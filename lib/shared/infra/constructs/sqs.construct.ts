import {
  Queue as awsQueue,
  QueueProps as awsQueueProps,
} from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";
import { addTags } from "../add-tags.util";
import { generateResourceName } from "../generatge-function-name.util";
import { EnvironmentVariable, Tag } from "../types";

interface QueueProps extends awsQueueProps {
  domain: string;
  tags?: Tag;
  environment?: EnvironmentVariable;
}

export class Queue extends awsQueue {
  constructor(scope: Construct, id: string, props: QueueProps) {
    const { domain, tags = {}, queueName, environment = {} } = props;

    super(scope, id, {
      ...props,
      queueName: generateResourceName(queueName || id, environment.STAGE),
    });

    addTags(this, domain, {
      ...tags,
      ...(environment.STAGE && { STAGE: environment.STAGE }),
    });
  }
}
