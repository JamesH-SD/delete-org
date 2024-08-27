/**
 * generate a function name for a resource based on the name provided
 * with the suffix of stage added to it.
 * @param name of the resource
 * @example
 * generateResourceName("getCMRulesLambda");
 * // dev-get_cm_rules_lambda
 */
export const generateResourceName = (name: string, stage?: string) => {
  return stage ? `${stage}-${toSnakeCase(name)}` : toSnakeCase(name);
};

/**
 * Convert a string to snake case
 * @param str
 * @example
 * toSnakeCase("getCMRulesLambda");
 * // get_cm_rules
 * toSnakeCase("get CM Rules Lambda");
 * // get_cm_rules_lambda
 */
export const toSnakeCase = (str: string): string =>
  str
    .replace(/([a-z])([A-Z])/g, "$1_$2") // Insert underscore before uppercase letters
    .replace(/([A-Z])([A-Z][a-z])/g, "$1_$2") // Insert underscore between uppercase sequences
    .replace(/([a-zA-Z])(\d)/g, "$1_$2") // Insert underscore between letters and numbers
    .replace(/(\d)([a-zA-Z])/g, "$1_$2") // Insert underscore between numbers and letters
    .replace(/\s+/g, "_") // Replace spaces with underscores
    .replace(/[^a-zA-Z0-9]+/g, "_") // Replace non-alphanumeric characters with underscores
    .replace(/lambda/gi, "") // Remove the word 'Lambda' in any case
    .replace(/_+/g, "_") // Replace multiple underscores with a single underscore
    .replace(/^_+|_+$/g, "") // Remove leading or trailing underscores
    .toLowerCase(); // Convert to lowercase
