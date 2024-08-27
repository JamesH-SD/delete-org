import {
  generateResourceName,
  toSnakeCase,
} from "./generatge-function-name.util";

// Test cases for toSnakeCase
describe("toSnakeCase", () => {
  test("converts a simple sentence to snake case", () => {
    expect(toSnakeCase("Hello World")).toBe("hello_world");
  });

  test("converts a camelCase string to snake case", () => {
    expect(toSnakeCase("camelCaseString")).toBe("camel_case_string");
  });

  test("converts a sentence with punctuation to snake case", () => {
    expect(toSnakeCase("This is a test.")).toBe("this_is_a_test");
  });

  test("converts a string with multiple spaces to snake case", () => {
    expect(toSnakeCase("This   is    a test")).toBe("this_is_a_test");
  });

  test("removes special characters and converts to snake case", () => {
    expect(toSnakeCase("Hello@World#")).toBe("hello_world");
  });

  test("handles mixed case and special characters correctly", () => {
    expect(toSnakeCase("Hello-World_123")).toBe("hello_world_123");
  });

  test("handles a string with underscores correctly", () => {
    expect(toSnakeCase("hello_world_test")).toBe("hello_world_test");
  });

  test("converts an already snake case string correctly", () => {
    expect(toSnakeCase("already_snake_case")).toBe("already_snake_case");
  });

  test("converts a single word to lower case", () => {
    expect(toSnakeCase("HELLO")).toBe("hello");
  });

  test("converts a complex camelCase string", () => {
    expect(toSnakeCase("getCMRulesLambda")).toBe("get_cm_rules");
  });

  test("converts a complex sentence with various cases and spaces", () => {
    expect(toSnakeCase("get CM Rules Lambda")).toBe("get_cm_rules");
  });

  test("removes the word Lambda in any case", () => {
    expect(toSnakeCase("MyLambdaFunction")).toBe("my_function");
    expect(toSnakeCase("my_lambda_function")).toBe("my_function");
    expect(toSnakeCase("MylambdaFunction")).toBe("my_function");
  });
});

// Test cases for generateFunctionName
describe("generateFunctionName", () => {
  test("generates a function name with the stage for a simple name", () => {
    expect(generateResourceName("HelloWorld", "dev")).toBe("hello_world-dev");
  });

  test("generates a function name with the stage for a camelCase name", () => {
    expect(generateResourceName("getCMRulesLambda", "prod")).toBe(
      "get_cm_rules-prod",
    );
  });

  test("generates a function name with the stage for a name with spaces", () => {
    expect(generateResourceName("get CM Rules Lambda", "stage")).toBe(
      "get_cm_rules-stage",
    );
  });

  test("generates a function name with the stage for a name with punctuation", () => {
    expect(generateResourceName("get-CM-Rules-Lambda!", "test")).toBe(
      "get_cm_rules-test",
    );
  });

  test("generates a function name with the stage for a name with special characters", () => {
    expect(generateResourceName("Hello@World#", "uat")).toBe("hello_world-uat");
  });

  test("generates a function name without the stage", () => {
    expect(generateResourceName("HelloWorld", "")).toBe("hello_world");
  });

  test("generates a function name without the stage when undefined", () => {
    expect(generateResourceName("HelloWorld")).toBe("hello_world");
  });
});
