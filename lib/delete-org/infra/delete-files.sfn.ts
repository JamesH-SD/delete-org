import { Duration } from "aws-cdk-lib";
import { ISecurityGroup, IVpc } from "aws-cdk-lib/aws-ec2";
import {
  DefinitionBody,
  IStateMachine,
  JsonPath,
  Pass,
  Result,
  StateMachineType,
  TaskInput,
} from "aws-cdk-lib/aws-stepfunctions";
import { LambdaInvoke } from "aws-cdk-lib/aws-stepfunctions-tasks";
import { Construct } from "constructs";
import { DOMAINS, EnvironmentVariable, StateMachine } from "../../shared/infra";
import { GetDocsToDeleteFn } from "./get-docs-to-delete.fn";
import { DeleteFilesFn } from "./delete-files.fn";

interface DeleteFileSfnProps {
  vpc: IVpc;
  environment: EnvironmentVariable;
  securityGroup: ISecurityGroup;
  docsBucketName: string;
  docsTbBucketName: string;
}

export class DeleteFileSfn extends Construct {
  stateMachine: IStateMachine;
  constructor(scope: Construct, id: string, props: DeleteFileSfnProps) {
    const {
      vpc,
      environment,
      securityGroup,
      docsTbBucketName,
      docsBucketName,
    } = props;

    super(scope, id);

    // Define a Pass state
    const passState = new Pass(this, "PassState", {
      result: Result.fromObject({ message: "Hello from Pass State" }),
    });

    const getDocsToDeleteFn = new GetDocsToDeleteFn(this, "GetDocsToDelete", {
      securityGroups: [securityGroup],
      timeout: Duration.seconds(30),
      environment,
      vpc,
    });

    new DeleteFilesFn(this, "DeleteFilesFn", {
      environment,
      functionName: "DeleteFiles",
      queueArn: getDocsToDeleteFn.queueArn,
      docsBucketName,
      docsTbBucketName,
      timeout: Duration.minutes(10),
    });

    const getDocsToDeleteTaskInvoke = new LambdaInvoke(
      this,
      "get docs to delete",
      {
        lambdaFunction: getDocsToDeleteFn.lambdaFn,
        payload: TaskInput.fromObject({
          orgId: JsonPath.stringAt("$.orgId"),
        }),
        outputPath: "$.Payload",
      },
    );

    const definition = getDocsToDeleteTaskInvoke;

    // Define the state machine
    this.stateMachine = new StateMachine(this, id, {
      domain: DOMAINS.DELETE_ORG,
      definitionBody: DefinitionBody.fromChainable(definition),
      environment,
      // TODO  change to express wnhen ready
      stateMachineType: StateMachineType.STANDARD,
    });
  }
}
