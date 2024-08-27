import {
  CloudWatchEventsClient,
  ListRulesCommand,
} from "@aws-sdk/client-cloudwatch-events";
import { Logger } from "@aws-lambda-powertools/logger";
import { RuleService } from "./rules.service";
import { mockClient } from "aws-sdk-client-mock";

// Mock the CloudWatchEventsClient
const cloudWatchClientMock = mockClient(CloudWatchEventsClient);

describe("RulesService", () => {
  let logger: Logger;
  let service: RuleService;

  beforeEach(() => {
    // Reset the mock
    cloudWatchClientMock.reset();

    // Create a mock logger
    logger = new Logger({ serviceName: "testService" });
    jest.spyOn(logger, "info").mockImplementation(() => {});
    jest.spyOn(logger, "error").mockImplementation(() => {});

    // Create the RulesService instance
    service = new RuleService(
      logger,
      cloudWatchClientMock as unknown as CloudWatchEventsClient,
    );
  });

  it("should get rules successfully", async () => {
    // Mock successful response
    cloudWatchClientMock.on(ListRulesCommand).resolves({
      Rules: [
        // mypokket-calc-task-counts-BN10TJMZV-demo
        { Name: "mypokket-calc-task-counts-cm1-dev" },
        { Name: "mypokket-calc-task-counts-cm2-dev" },
      ],
    });

    // Call the method
    const rules = await service.getRules();

    // Assertions
    expect(logger.info).toHaveBeenCalledWith("Getting rules");
    expect(logger.info).toHaveBeenCalledWith("Got rules", {
      rules: [
        { Name: "mypokket-calc-task-counts-cm1-dev" },
        { Name: "mypokket-calc-task-counts-cm2-dev" },
      ],
    });

    if (rules.type === "ok") {
      expect(rules.value).toEqual({
        countOfCaseManagers: 0,
        countOfRules: 2,
        rules: [
          {
            Name: "mypokket-calc-task-counts-cm1-dev",
            caseManager: {
              id: "cm1",
              name: "n/a",
            },
          },
          {
            Name: "mypokket-calc-task-counts-cm2-dev",
            caseManager: {
              id: "cm2",
              name: "n/a",
            },
          },
        ],
      });
    }
  });

  it("should throw an error when getting rules fails", async () => {
    // Mock error response
    cloudWatchClientMock.on(ListRulesCommand).rejects(new Error("Some error"));

    // Call the method and expect an error
    const rules = await service.getRules();
    if (rules.type === "err") {
      expect(rules.error).toBe("Error getting rules");
    }

    // Assertions
    expect(logger.info).toHaveBeenCalledWith("Getting rules");
    expect(logger.error).toHaveBeenCalledWith("Error", {
      error: new Error("Some error"),
    });
  });
});
