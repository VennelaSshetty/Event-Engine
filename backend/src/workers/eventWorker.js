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

import WorkflowExecutionService
from "../services/workflowExecutionService.js";

import validateWorkflows from "../validators/validateWorkflows.js";
import eventQueue from "../queues/queue.js";

// --------------------
// DB CONNECTION
// --------------------
await mongoose.connect(config.mongoUri);

logger.info({
  service: "worker",
  message: "Worker connected to MongoDB"
});

try {
  validateWorkflows();

  logger.info({
    service: "worker",
    message: "Workflow configuration validated"
  });

} catch (err) {

  logger.error({
    service: "worker",
    message: err.message
  });

  process.exit(1);
}


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

    let retryCount;

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
     await Event.findByIdAndUpdate(eventId,{
    status:EVENT_STATUS.PROCESSING,
    startedAt
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

// --------------------
// WORKFLOW ENGINE
// --------------------

workflowExecution =
  await WorkflowExecutionService.startWorkflow({
    event,
    correlationId
  });

const plan = await createPlan(
  type,
  workflowExecution.workflowVersion
);

for (const stage of plan) {

  // PARALLEL

 if (stage.type === "parallel") {

  const results = await Promise.allSettled(

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

  const failedResult = results.find(
    (result) => result.status === "rejected"
  );

  if (failedResult) {
    throw failedResult.reason;
  }

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
const completedAt = new Date();

await Event.findByIdAndUpdate(eventId, {
  status: EVENT_STATUS.COMPLETED,
  completedAt,
  processingTimeMs:
    completedAt.getTime() - startedAt.getTime(),
  retryCount:0,
  isInDLQ:false,
  failedAt:null,
  dlqReason:null,
  movedToDLQAt:null
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
 error: err.message,
 stack: err.stack
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


const currentEvent = await Event.findById(eventId).lean();

retryCount = (currentEvent.retryCount || 0) + 1;


logger.info({
  eventId,
  retryCount,
  maxRetries: config.retryAttempts
});

     if (err.isRetryable === false) {



 await dlq.add("failed-event", {
    eventId,
    correlationId,
    retryCount,
    error: err.message,
    errorType: "NON_RETRYABLE",
    failedAt: new Date()
});

logger.warn({
    eventId,
    message: "Event sent to DLQ (non-retryable)"
});

return;
}

const isFinalAttempt =
  retryCount >= config.retryAttempts;

await Event.findByIdAndUpdate(eventId, {
  status: isFinalAttempt
    ? EVENT_STATUS.FAILED
    : EVENT_STATUS.RETRYING,

  ...(isFinalAttempt && {
    failedAt: new Date()
  }),

  $inc: {
    retryCount: 1
  },

  processingTimeMs:
    Date.now() - startedAt,

  dlqReason: err.message
});

if (isFinalAttempt) {


await dlq.add("failed-event", {
    eventId,
    correlationId,
    retryCount,
    error: err.message,
    failedAt: new Date()
});

logger.warn({
    eventId,
    retryCount,
    message: "Event sent to DLQ"
});

return;
}
      // NON-RETRYABLE
throw err;
    }

  })

);
const failedEvents = [];

for (let index = 0; index < results.length; index++) {

    if (results[index].status === "rejected") {
const event = await Event.findById(events[index].eventId);

if(
  event &&
  event.retryCount < config.retryAttempts
){
    failedEvents.push(events[index]);
}
    }
}
if(failedEvents.length){

    logger.warn({

        batchSize:events.length,

        failedCount:failedEvents.length,

        message:"Retrying only failed events"

    });

await eventQueue.add(
 "process-batch",
 {
   events: failedEvents
 },
 {
   delay: config.retryDelay,
   attempts: 1
 }
);

}
  },
  {
    connection,
    concurrency: config.workerConcurrency,

    metrics: {
      maxDataPoints: 20160
    }
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

worker.on("stalled", (jobId) => {
  logger.warn({
    jobId,
    message: "Job stalled"
  });
});

const shutdown = async (signal) => {
  logger.info({
    service: "event-worker",
    signal,
    message: "Graceful shutdown initiated"
  });

  try {
    // Stop accepting new jobs and wait for active jobs to finish
    await worker.close();

    logger.info({
      service: "event-worker",
      message: "Event worker closed"
    });

    // Close MongoDB connection
    await mongoose.connection.close();

    logger.info({
      service: "event-worker",
      message: "MongoDB connection closed"
    });

    // Close Redis connection
    await connection.quit();

    logger.info({
      service: "event-worker",
      message: "Redis connection closed"
    });

    logger.info({
      service: "event-worker",
      message: "Graceful shutdown completed"
    });

    process.exit(0);
  } catch (err) {
    logger.error({
      service: "event-worker",
      error: err.message,
      message: "Graceful shutdown failed"
    });

    process.exit(1);
  }
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
