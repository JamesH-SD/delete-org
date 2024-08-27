import { decomposeRuleName, RuleName } from "./shared"; // Adjust the path to your module

// Test data and expected results
const testData = [
  {
    input: "mypokket-calc-task-counts-1xzgl4Qioy-dev",
    expected: {
      stage: "dev",
      cmId: "1xzgl4Qioy",
      perfix: "mypokket-calc-task-counts",
      raw: "mypokket-calc-task-counts-1xzgl4Qioy-dev",
    },
  },
  {
    input: "mypokket-calc-task-counts-2xzgl4Qioy-dev",
    expected: {
      stage: "dev",
      cmId: "2xzgl4Qioy",
      perfix: "mypokket-calc-task-counts",
      raw: "mypokket-calc-task-counts-2xzgl4Qioy-dev",
    },
  },
];

describe("decomposeRuleName", () => {
  testData.forEach(({ input, expected }) => {
    test(`should decompose '${input}' correctly`, () => {
      const result = decomposeRuleName(input);
      if (result.type === "ok") {
        expect(result.value).toEqual(expected);
      }
    });
  });

  test("should handle an empty string", () => {
    const result = decomposeRuleName("");
    const expected = "Rule name is required";
    if (result.type === "err") {
      expect(result.error).toEqual(expected);
    }
  });

  test("should handle a string without hyphens", () => {
    const result = decomposeRuleName("nohyphenshere");
    const expected = `Invalid rule name: nohyphenshere it required 5 parts`;
    if (result.type === "err") {
      expect(result.error).toEqual(expected);
    }
  });

  test("should handle a string with one hyphen", () => {
    const result = decomposeRuleName("single-dev");
    const expected = "Invalid rule name: single-dev it required 5 parts";
    if (result.type === "err") {
      expect(result.error).toEqual(expected);
    }
  });
});
