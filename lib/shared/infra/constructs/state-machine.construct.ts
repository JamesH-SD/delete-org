import {
  StateMachine as awsStateMachine,
  StateMachineProps as awsStateMachineProps,
} from "aws-cdk-lib/aws-stepfunctions";
import { Construct } from "constructs";
import { addTags } from "../add-tags.util";
import { generateResourceName } from "../generatge-function-name.util";
import { EnvironmentVariable, Tag } from "../types";

interface StateMachineProps extends awsStateMachineProps {
  domain: string;
  tags?: Tag;
  environment?: EnvironmentVariable;
}

export class StateMachine extends awsStateMachine {
  constructor(scope: Construct, id: string, props: StateMachineProps) {
    const { domain, tags = {}, environment = {}, stateMachineName } = props;

    super(scope, id, {
      ...props,
      stateMachineName: generateResourceName(
        stateMachineName || id,
        environment.STAGE,
      ),
    });

    addTags(this, domain, {
      ...tags,
      ...(environment.STAGE && { STAGE: environment.STAGE }),
    });
  }
}
