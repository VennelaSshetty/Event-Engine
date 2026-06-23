import { Worker } from "bullmq";
import mongoose from "mongoose";
import Event from "../models/Event.js";
import { EVENT_STATUS } from "../config/eventStatus.js";
import connection from "../config/redis.js";
import dlq from "../queues/dlq.js";

import logger from "../utils/logger.js";
import config from "../config/env.js";

import { createPlan } from "../workflow-engine/planner.js";
import { executeStep } from "../workflow-engine/executor.js";
import { warmWorkflowCache } from "../services/workflowCache.service.js";
import WorkflowExecutionService
from "../services/workflowExecutionService.js";

// --------------------
// DB CONNECTION
// --------------------
await mongoose.connect(config.mongoUri);

logger.info({
  service: "worker",
  message: "Worker connected to MongoDB"
});

await warmWorkflowCache();

logger.info({
  service: "worker",
  message: "Workflow cache warmed"
});

// --------------------
// WORKER
// --------------------
const worker = new Worker(
  "event-queue",
async (job) => {

  const { events } = job.data;

if (!events || !Array.isArray(events)) {

  logger.error({
    service: "worker",
    jobId: job.id,
    rawJobData: job.data,
    message: "Invalid job payload"
  });

  throw new Error("Invalid job payload: events array missing");
}

  logger.info({
    service: "worker",
    batchSize: events.length,
    message: "Batch processing started"
  });

const results=await Promise.allSettled(

  events.map(async (item) => {

    const { eventId, correlationId } = item;

    const startedAt = new Date();

    let workflowExecution = null;

    try {

      const event = await Event.findById(eventId);

      if (!event) {

        logger.error({
          service: "worker",
          eventId,
          correlationId,
          message: "Event not found"
        });

        return;
      }

      const { type, payload } = event;

      if (!correlationId) {

        logger.error({
          service: "worker",
          eventId,
          message: "Missing correlationId"
        });

        return;
      }

      // --------------------
      // MARK PROCESSING
      // --------------------
      await Event.findByIdAndUpdate(eventId, {
        status: EVENT_STATUS.PROCESSING,
        startedAt,
        retryCount: job.attemptsMade
      });

      logger.info({
        correlationId,
        eventId,
        eventType: type,
        message: "Processing started"
      });

      // --------------------
      // WORKFLOW ENGINE
      // --------------------

      const plan = await createPlan(type, payload, {
        correlationId,
        eventType: type,
        eventId
      });

      workflowExecution =
  await WorkflowExecutionService.startWorkflow({
    event,
    correlationId
  });

for (const stage of plan) {

  // PARALLEL

  if (stage.type === "parallel") {

    await Promise.all(

      stage.actions.map(async (action) => {

        const alreadyCompleted =
          await WorkflowExecutionService
            .isActionCompleted({
              workflowExecutionId:
                workflowExecution._id,
              actionName: action
            });

        if (alreadyCompleted) {

          logger.info({
            correlationId,
            eventId,
            action,
            message:
              "Skipping already completed action"
          });

          return;
        }

        await executeStep({
          action,
          payload,
          context: {
            correlationId,
            eventType: type,
            eventId
          }
        });

        await WorkflowExecutionService
          .markActionCompleted({
            workflowExecutionId:
              workflowExecution._id,
            actionName: action
          });

        logger.info({
          correlationId,
          eventId,
          action,
          message:
            "Action completed successfully"
        });

      })
    );

  }

  // SEQUENTIAL

  else {

    for (const action of stage.actions) {

      const alreadyCompleted =
        await WorkflowExecutionService
          .isActionCompleted({
            workflowExecutionId:
              workflowExecution._id,
            actionName: action
          });

      if (alreadyCompleted) {

        logger.info({
          correlationId,
          eventId,
          action,
          message:
            "Skipping already completed action"
        });

        continue;
      }

      await executeStep({
        action,
        payload,
        context: {
          correlationId,
          eventType: type,
          eventId
        }
      });

      await WorkflowExecutionService
        .markActionCompleted({
          workflowExecutionId:
            workflowExecution._id,
          actionName: action
        });

      logger.info({
        correlationId,
        eventId,
        action,
        message:
          "Action completed successfully"
      });

    }
  }
}

      // --------------------
      // SUCCESS
      // --------------------
      await WorkflowExecutionService
  .markWorkflowCompleted(
    workflowExecution._id
  );

    await Event.findByIdAndUpdate(eventId, {
  status: EVENT_STATUS.COMPLETED,
  completedAt: new Date(),
  processingTimeMs: Date.now() - startedAt,

  isInDLQ: false,
  dlqReason: null,
  movedToDLQAt: null
});

      logger.info({
        correlationId,
        eventId,
        status: "COMPLETED"
      });

    } catch (err) {

      logger.error({
        correlationId,
        eventId,
        error: err.message
      });

 if (workflowExecution) {

  await WorkflowExecutionService
    .markWorkflowFailed({
      workflowExecutionId:
        workflowExecution._id,

      failedAction:
        err.failedAction || "unknown"
    });

}

   await Event.findByIdAndUpdate(eventId, {
  status: EVENT_STATUS.FAILED,
  failedAt: new Date(),
  retryCount: job.attemptsMade,
  dlqReason: err.message
});



      // NON-RETRYABLE
      if (err.isRetryable === false) {

        await dlq.add("failed-event", {
          eventId,
          correlationId,
          error: err.message,
          errorType: "NON_RETRYABLE",
          attemptsMade: job.attemptsMade,
          failedAt: new Date()
        });

        logger.warn({
          eventId,
          message: "Moved to DLQ (non-retryable)"
        });

        return;
      }
       throw err;
    }

  })

);
const failedEvents = results.filter(
  (result) => result.status === "rejected"
);

if (failedEvents.length > 0) {

  logger.error({
    failedCount: failedEvents.length,
    total: results.length,
    message: "Some events failed in batch"
  });

  throw new Error("BATCH_PARTIAL_FAILURE");
}
  },
  {
    connection,
    concurrency: config.workerConcurrency
  }
);

// --------------------
// EVENTS
// --------------------
worker.on("completed", async (job) => {

  logger.info({
    service: "worker",
    jobId: job.id,
    batchSize: job.data.events.length,
    status: "BATCH_FINISHED"
  });
});

worker.on("failed", async (job, err) => {

  logger.error({
    jobId: job.id,
    attemptsMade: job.attemptsMade,
    maxAttempts: job.opts.attempts,
    error: err.message
  });

if (job.attemptsMade >= job.opts.attempts) {

  // Mark all failed events as DLQ
for (const item of job.data.events) {

  const event = await Event.findById(item.eventId);

  await Event.findByIdAndUpdate(
    item.eventId,
    {
      isInDLQ: true,
      movedToDLQAt: new Date(),

      // preserve original failure reason
      dlqReason: event?.dlqReason || err.message
    }
  );
}

  await dlq.add(
    "failed-batch",
    {
      events: job.data.events,
      errorType: "RETRYABLE",
      dlqRetryCount: job.data.dlqRetryCount || 0,
      reason: err.message,
      failedAt: new Date()
    }
  );

  logger.warn({
    jobId: job.id,
    message: "Moved to DLQ after max retries"
  });
}
});

worker.on("stalled", (jobId) => {
  logger.warn({
    jobId,
    message: "Job stalled"
  });
});

