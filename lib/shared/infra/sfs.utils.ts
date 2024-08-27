import { StateMachine, StateMachineProps } from "aws-cdk-lib/aws-stepfunctions";
import { addTags } from "./add-tags.util";
import { Construct } from "constructs";
import { generateResourceName } from "./generatge-function-name.util";
import { EnvironmentVariable, Tag } from "./types";

export const stateMachineFn = (
  scope: Construct,
  params: {
    name: string;
    domain: string;
    states: StateMachineProps;
    tags?: Tag;
    envs?: EnvironmentVariable;
  },
): StateMachine => {
  const { name, domain, states, tags = {}, envs = {} } = params;

  const sm = new StateMachine(scope, name, {
    stateMachineName: generateResourceName(name, envs.STAGE),
    ...states,
  });
  addTags(sm, domain, { ...tags, ...(envs.STAGE && { STAGE: envs.STAGE }) });

  return sm;
};
