import { NodejsFunctionProps } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import {
  DOMAINS,
  EnvironmentVariable,
  LAMBDAS,
  NodeJSFn,
  Queue,
  Topic,
} from "../../shared/infra";
import { Duration } from "aws-cdk-lib";
import { SqsSubscription } from "aws-cdk-lib/aws-sns-subscriptions";

interface PrepareDataForDeleteUserDataFnProps extends NodejsFunctionProps {
  environment: EnvironmentVariable;
}
export class PrepareDataForDeleteUserDataFn extends Construct {
  lambdaFn: NodeJSFn;
  constructor(
    scope: Construct,
    id: string,
    props: PrepareDataForDeleteUserDataFnProps,
  ) {
    const { environment } = props;
    super(scope, id);

    const deleteUserDataTopic = new Topic(this, "DeleteUserDataTopic", {
      domain: DOMAINS.DELETE_ORG,
      environment: environment,
      topicName: "DeleteUserData",
      displayName: `${environment.STAGE} - Delete User Data `,
    });

    const cognitoUserQueue = new Queue(this, "CognitoUserQueue", {
      domain: DOMAINS.DELETE_ORG,
      environment: props.environment,
      visibilityTimeout: Duration.seconds(600),
      retentionPeriod: Duration.days(3),
    });

    const dynamoDbQueue = new Queue(this, "DynamoDbQueue", {
      domain: DOMAINS.DELETE_ORG,
      environment: props.environment,
      visibilityTimeout: Duration.seconds(600),
      retentionPeriod: Duration.days(3),
    });

    this.lambdaFn = new NodeJSFn(this, id, {
      domain: DOMAINS.DELETE_ORG,
      lambdaFn: LAMBDAS.DELETE_ORG.PREPARE_DATA_FOR_DELETE_USER_DATA,
      description: `Prepare data for delete user data and push it to the topic 
for processing`,
      ...props,
      environment: {
        ...props.environment,
        TOPIC_ARN: deleteUserDataTopic.topicArn,
      },
    });

    deleteUserDataTopic.grantPublish(this.lambdaFn);
    deleteUserDataTopic.addSubscription(
      new SqsSubscription(cognitoUserQueue, {}),
    );
    deleteUserDataTopic.addSubscription(new SqsSubscription(dynamoDbQueue, {}));
  }
}
