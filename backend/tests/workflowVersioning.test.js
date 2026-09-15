import Event from "../src/models/Event.js";
import WorkflowExecution from "../src/models/WorkflowExecution.js";

import WorkflowExecutionService
  from "../src/services/workflowExecutionService.js";

import { createPlan } from "../src/workflow-engine/planner.js";

describe("Workflow Versioning", () => {
  test("should keep the original workflow version when current version changes", async () => {
    const event = await Event.create({
      type: "USER_SIGNUP",
      payload: {
        userId: "user_version_1",
        email: "version@test.com"
      },
      idempotencyKey: "version_test_001",
      appName: "TestApp",
      correlationId: "corr_version"
    });

    // Event starts while version 1 is current
    const firstExecution =
      await WorkflowExecutionService.startWorkflow({
        event,
        correlationId: "corr_version",
        currentVersion: 1
      });

    expect(firstExecution.workflowVersion)
      .toBe(1);

    // Simulate version 2 becoming current
    const resumedExecution =
      await WorkflowExecutionService.startWorkflow({
        event,
        correlationId: "corr_version",
        currentVersion: 2
      });

    // Existing execution MUST remain on version 1
    expect(resumedExecution.workflowVersion)
      .toBe(1);

    // Planner must therefore resolve version 1
    const plan =
      await createPlan(
        event.type,
        resumedExecution.workflowVersion
      );

    expect(plan).toEqual([
      {
        type: "sequential",
        actions: ["sendWelcomeEmail"]
      },
      {
        type: "sequential",
        actions: ["sendNotification"]
      },
      {
        type: "sequential",
        actions: ["trackAnalytics"]
      }
    ]);
  });
});