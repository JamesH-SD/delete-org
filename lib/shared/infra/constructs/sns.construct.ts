import {
  Topic as awsTopic,
  TopicProps as awsTopicProps,
} from "aws-cdk-lib/aws-sns";
import { Construct } from "constructs";
import { addTags } from "../add-tags.util";
import { generateResourceName } from "../generatge-function-name.util";
import { EnvironmentVariable, Tag } from "../types";

interface TopicProps extends awsTopicProps {
  domain: string;
  tags?: Tag;
  environment?: EnvironmentVariable;
}

export class Topic extends awsTopic {
  constructor(scope: Construct, id: string, props: TopicProps) {
    const { domain, tags = {}, topicName, environment = {} } = props;

    super(scope, id, {
      ...props,
      topicName: generateResourceName(topicName || id, environment.STAGE),
    });

    addTags(this, domain, {
      ...tags,
      ...(environment.STAGE && { STAGE: environment.STAGE }),
    });
  }
}
