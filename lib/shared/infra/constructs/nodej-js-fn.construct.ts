import { Code, Runtime } from "aws-cdk-lib/aws-lambda";
import {
  NodejsFunction,
  NodejsFunctionProps,
} from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import path from "path";
import { addTags } from "../add-tags.util";
import { EnvironmentVariable, Tag } from "../types";
import { generateResourceName } from "../generatge-function-name.util";

interface NodeJSFnProps extends NodejsFunctionProps {
  domain: string;
  lambdaFn: string;
  tags?: Tag;
  environment?: EnvironmentVariable;
}

export class NodeJSFn extends NodejsFunction {
  constructor(scope: Construct, id: string, props: NodeJSFnProps) {
    const {
      domain,
      lambdaFn,
      tags = {},
      environment = {},
      functionName,
    } = props;
    const pathToBuildFile = path.join(__dirname, "../../../..", "build.mjs");

    // assuming the `handler` property is specified as 'index.handler' (as in this example), then
    // this 'build-output' directory must contain an index.js file with an exported `handler` function.
    const pathToOutputFile = path.join(
      __dirname,
      "../../../../",
      "dist",
      domain,
      lambdaFn,
    );

    const commandThatIsRanDuringCdkSynth = [
      "node",
      pathToBuildFile,
      domain,
      lambdaFn,
    ];
    const code = Code.fromCustomCommand(
      pathToOutputFile,
      commandThatIsRanDuringCdkSynth,
    );

    super(scope, id, {
      ...props,
      functionName: generateResourceName(functionName || id, environment.STAGE),
      runtime: Runtime.NODEJS_LATEST,
      handler: "index.handler",
      code,
    });
    addTags(this, domain, {
      ...tags,
      ...(environment.STAGE && { STAGE: environment.STAGE }),
    });
  }
}
