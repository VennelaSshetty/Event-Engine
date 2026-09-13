import Event from "../src/models/Event.js";
import WorkflowExecution from "../src/models/WorkflowExecution.js";
import WorkflowExecutionService
  from "../src/services/workflowExecutionService.js";

describe("Workflow Resume", () => {

  test("should resume a failed workflow without losing completed actions", async () => {

    const event = await Event.create({

      type: "USER_SIGNUP",

      payload: {
        userId: "user_500",
        email: "resume@test.com"
      },

      idempotencyKey: "resume_test_001",

      appName: "TestApp",

      correlationId: "corr_resume"

    });

    await WorkflowExecution.create({

      eventId: event._id,

      workflowName: "USER_SIGNUP",

      status: "failed",

      completedActions: [
        "sendWelcomeEmail",
        "sendNotification"
      ],

      failedAction: "trackAnalytics",

      failedAt: new Date(),

      correlationId: "corr_resume"

    });

    const resumed =
      await WorkflowExecutionService.startWorkflow({

        event,

        correlationId: "corr_resume"

      });

    expect(resumed.status)
      .toBe("processing");

    expect(resumed.failedAction)
      .toBeNull();

    expect(resumed.failedAt)
      .toBeNull();

    expect(resumed.completedActions)
      .toEqual([
        "sendWelcomeEmail",
        "sendNotification"
      ]);

  });

});