import mongoose from "mongoose";

import Event from "../src/models/Event.js";
import WorkflowExecution from "../src/models/WorkflowExecution.js";

import WorkflowExecutionService
  from "../src/services/workflowExecutionService.js";

describe("Workflow Execution", () => {

  test("concurrent startWorkflow should create only one workflow execution", async () => {

    const event = await Event.create({

      type: "USER_SIGNUP",

      payload: {
        userId: "user_100",
        email: "test@gmail.com"
      },

      idempotencyKey: "workflow_test_001",

      appName: "TestApp",

      correlationId: "corr_test"

    });

    await Promise.all([

      WorkflowExecutionService.startWorkflow({

        event,

        correlationId: "corr_test"

      }),

      WorkflowExecutionService.startWorkflow({

        event,

        correlationId: "corr_test"

      })

    ]);

    const workflows =
      await WorkflowExecution.find({

        eventId: event._id

      });

    expect(workflows).toHaveLength(1);

  });

});