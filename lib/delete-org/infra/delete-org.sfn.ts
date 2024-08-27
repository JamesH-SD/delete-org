import { Duration } from "aws-cdk-lib";
import { ISecurityGroup, IVpc } from "aws-cdk-lib/aws-ec2";
import {
  DefinitionBody,
  IntegrationPattern,
  JsonPath,
  Map,
  Parallel,
  Pass,
  Result,
  TaskInput,
} from "aws-cdk-lib/aws-stepfunctions";
import {
  LambdaInvoke,
  StepFunctionsStartExecution,
} from "aws-cdk-lib/aws-stepfunctions-tasks";
import { Construct } from "constructs";
import { DOMAINS, EnvironmentVariable, StateMachine } from "../../shared/infra";
import { DeleteDynamoDbDataSfn } from "./delete-dynamodb-data.sfn";
import { DeleteFileSfn } from "./delete-files.sfn";
import { PrepareDataForDeleteOrgFn } from "./prepare-data-for-delete-org.fn";
import { DeleteRdbmsDataSfn } from "./delete-rdbms-data.sfn";
import { DeleteCognitoUserSfn } from "./delete-cognito-users.sfn";
import { PrepareDataForDeleteUserDataFn } from "./prepare-data-for-delete-user-data.fn";

interface DeleteOrgSfnProps {
  vpc: IVpc;
  environment: EnvironmentVariable;
  securityGroup: ISecurityGroup;
  docsBucketName: string;
  docsTbBucketName: string;
}

export class DeleteOrgSfn extends Construct {
  constructor(scope: Construct, id: string, props: DeleteOrgSfnProps) {
    super(scope, id);
    const {
      vpc,
      environment,
      securityGroup,
      docsBucketName,
      docsTbBucketName,
    } = props;

    const prepareDeleteOrgDataFn = new PrepareDataForDeleteOrgFn(
      this,
      "PrepareDeleteOrgData",
      {
        securityGroups: [securityGroup],
        timeout: Duration.seconds(10),
        environment,
        vpc,
      },
    );
    const prepareDataForDeleteOrg = new LambdaInvoke(
      this,
      "Prepare data for delete org",
      {
        lambdaFunction: prepareDeleteOrgDataFn.lambdaFn,
        payload: TaskInput.fromObject({
          leadAgencyId: JsonPath.stringAt("$.leadAgencyId"),
        }),
        outputPath: "$.Payload",
      },
    );

    const deletFileSfn = new DeleteFileSfn(this, "DeleteFiles", {
      environment,
      securityGroup,
      vpc,
      docsBucketName,
      docsTbBucketName,
    });

    const deleteFileSfnStartExecution = new StepFunctionsStartExecution(
      this,
      "Delete Files",
      {
        stateMachine: deletFileSfn.stateMachine,
        // integrationPattern: IntegrationPattern.WAIT_FOR_TASK_TOKEN,
      },
    );

    const deleteDynamoDbDataSfn = new DeleteDynamoDbDataSfn(
      this,
      "DeleteDynamoDBData",
      {
        environment,
      },
    );
    const deleteDynamoDbDataStartExecution = new StepFunctionsStartExecution(
      this,
      "delete DynamoDB Data",
      {
        stateMachine: deleteDynamoDbDataSfn.stateMachine,
        // integrationPattern: IntegrationPattern.WAIT_FOR_TASK_TOKEN,
      },
    );

    const deleteCognitoUsersSfn = new DeleteCognitoUserSfn(
      this,
      "DeleteCognitoUsers",
      {
        environment,
      },
    );
    const deleteCognitoUserStartExecution = new StepFunctionsStartExecution(
      this,
      "delete Cognito Users",
      {
        stateMachine: deleteCognitoUsersSfn.stateMachine,
        // integrationPattern: IntegrationPattern.WAIT_FOR_TASK_TOKEN,
      },
    );

    const deleteRdbmsDataSfn = new DeleteRdbmsDataSfn(this, "DeleteRdbmsData", {
      environment,
    });
    const deleteRdbmsDataStartExecution = new StepFunctionsStartExecution(
      this,
      "delete RDMS Data",
      {
        stateMachine: deleteRdbmsDataSfn.stateMachine,
        // integrationPattern: IntegrationPattern.WAIT_FOR_TASK_TOKEN,
      },
    );

    const prepareDeleteForDeleteUserDataFn = new PrepareDataForDeleteUserDataFn(
      this,
      "PrepareDataForDeleteUserData",
      {
        securityGroups: [securityGroup],
        environment,
        vpc,
        timeout: Duration.minutes(10),
      },
    );
    const prepareDataForDeleteUserData = new LambdaInvoke(
      this,
      "Prepare data for delete user data",
      {
        lambdaFunction: prepareDeleteForDeleteUserDataFn.lambdaFn,
        payload: TaskInput.fromObject({
          orgId: JsonPath.stringAt("$.orgId"),
        }),
        outputPath: "$.Payload",
      },
    );

    const mapState = new Map(this, "Iterating over OrgsIds", {
      inputPath: "$.allOrgIds",
    });

    const parallelState = new Parallel(this, "ParallelState");
    parallelState.branch(deleteFileSfnStartExecution);
    parallelState.branch(prepareDataForDeleteUserData);
    // parallelState.branch(deleteCognitoUserStartExecution);

    mapState.itemProcessor(parallelState);
    // Define a Pass state
    const passState = new Pass(this, "PassState", {
      result: Result.fromObject({ message: "Hello from Pass State" }),
    });

    // const parallelState = new Parallel(this, "ParallelState");
    // parallelState.branch(passState);
    //
    const definition = prepareDataForDeleteOrg
      .next(mapState)
      .next(deleteRdbmsDataStartExecution);

    // Define the state machine
    new StateMachine(this, id, {
      domain: DOMAINS.DELETE_ORG,
      definitionBody: DefinitionBody.fromChainable(definition),
      environment,
    });
  }
}
