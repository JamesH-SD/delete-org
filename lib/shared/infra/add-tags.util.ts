import { Tags } from "aws-cdk-lib";
import { Construct } from "constructs";

export const defaultTags = {
  app: "mypokket-utils",
};

/**
 * Add tags to a construct
 * @param construct to add tags to
 * @param tags to add to the construct
 * @example
 * addTags(getCMRulesLambda, { env: "dev" });
 * addTags(getCMRulesLambda);
 * addTags(getCMRulesLambda, { env: "prod" });
 * addTags(getCMRulesLambda, { env: "prod", app: "mypokket-utils" });
 */
export const addTags = (
  construct: Construct,
  domain: string,
  tags: { [key: string]: string } = {},
): void => {
  Object.entries({ ...defaultTags, domain, ...tags }).forEach(
    ([key, value]) => {
      Tags.of(construct).add(key, value);
    },
  );
};
