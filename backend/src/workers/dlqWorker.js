import { Worker } from "bullmq";
import connection from "../config/redis.js";
import logger from "../utils/logger.js";
import eventQueue from "../queues/queue.js";

const dlqWorker = new Worker(
  "dead-letter-queue",
  async (job) => {

  const {
  events,
  errorType,
  dlqRetryCount = 0
} = job.data;

const firstEvent = events?.[0];

if (!firstEvent) {
  logger.error({
    message: "No events found in DLQ payload"
  });

  return;
}

const { eventId, correlationId } = firstEvent;

    logger.info({
      eventId,
      message: "Processing DLQ event"
    });

    // ----------------------------
    // 1. RETRYABLE ERROR
    // ----------------------------
    if (errorType === "RETRYABLE") {

      // ❗ IMPORTANT SAFETY RULE
      // Only allow ONE retry from DLQ
      if (dlqRetryCount >= 1) {
        logger.warn({
          eventId,
          message: "DLQ retry limit reached → manual inspection needed"
        });
        return;
      }

     await eventQueue.add(
  "process-event",
  {
    events: [
      {
        eventId,
        correlationId
      }
    ],
    dlqRetryCount: dlqRetryCount + 1
  },
  {
    attempts: 3
  }
);

      logger.info({
        eventId,
        message: "Requeued from DLQ (one-time retry)"
      });

      return;
    }

    // ----------------------------
    // 2. NON-RETRYABLE ERROR
    // ----------------------------
    logger.warn({
      eventId,
      errorType,
      message: "Stored in DLQ for manual inspection (no retry)"
    });
  },
  {
    connection,
    concurrency: 2
  }
);

dlqWorker.on("completed", (job) => {
  logger.info({
    jobId: job.id,
    status: "DLQ_PROCESSED"
  });
});