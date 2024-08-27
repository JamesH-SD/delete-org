import {
  DefinitionBody,
  IStateMachine,
  Pass,
  Result,
  StateMachineType,
} from "aws-cdk-lib/aws-stepfunctions";
import { Construct } from "constructs";
import { DOMAINS, EnvironmentVariable, StateMachine } from "../../shared/infra";

interface DeleteCognitoUserSfnProps {
  environment: EnvironmentVariable;
}

export class DeleteCognitoUserSfn extends Construct {
  stateMachine: IStateMachine;
  constructor(scope: Construct, id: string, props: DeleteCognitoUserSfnProps) {
    const { environment } = props;
    super(scope, id);

    // Define a Pass state
    const passState = new Pass(this, "PassState", {
      result: Result.fromObject({ message: "Hello from Pass State" }),
    });

    const definition = passState;

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
