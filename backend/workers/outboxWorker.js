import OutboxEvent from "../models/OutboxEvent.js";
import eventQueue from "../queue/queue.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import logger from "../utils/logger.js";

dotenv.config();

await mongoose.connect(process.env.MONGO_URI);

logger.info({
  service: "outbox-worker",
  message: "Outbox Worker connected to MongoDB"
});

const BATCH_SIZE = 10;

/**
 * Process pending outbox events
 */
const processOutbox = async () => {
  try {
    const events = await OutboxEvent.find({ status: "PENDING" })
      .sort({ createdAt: 1 })
      .limit(BATCH_SIZE);

    if (events.length === 0) return;

    logger.info({
      service: "outbox-worker",
      batchSize: events.length,
      message: "Processing outbox batch"
    });

    for (const event of events) {
      try {
        const correlationId = event.correlationId;

        // 🔥 ALWAYS PRINT CORRELATION FIRST
        console.log("CORRELATION-ID:", correlationId);

        logger.info({
          service: "outbox-worker",
          eventId: event.eventId,
          outboxId: event._id,
          correlationId,
          message: "ABOUT TO PUSH TO QUEUE"
        });

        // 🚨 PUSH TO QUEUE (IMPORTANT FIX HERE)
        await eventQueue.add(
          "process-event",
          {
            eventId: event.eventId, // ✅ MUST BE EVENT COLLECTION ID
            type: event.eventType,
            payload: event.payload,
            correlationId
          },
          {
            attempts: 5,
            backoff: {
              type: "exponential",
              delay: 5000
            }
          }
        );

        // mark SENT
        event.status = "SENT";
        event.processedAt = new Date();
        await event.save();

        logger.info({
          service: "outbox-worker",
          eventId: event.eventId,
          outboxId: event._id,
          correlationId,
          eventType: event.eventType,
          status: "SENT",
          message: "Event pushed to queue successfully"
        });

      } catch (err) {
        logger.error({
          service: "outbox-worker",
          eventId: event.eventId,
          outboxId: event._id,
          correlationId: event.correlationId,
          error: err.message,
          message: "Failed to push event to queue"
        });

        event.retries = (event.retries || 0) + 1;
        event.lastError = err.message;

        if (event.retries >= 5) {
          event.status = "FAILED";

          logger.warn({
            service: "outbox-worker",
            eventId: event.eventId,
            correlationId: event.correlationId,
            status: "FAILED",
            message: "Event permanently failed in outbox"
          });
        }

        await event.save();
      }
    }

  } catch (err) {
    logger.error({
      service: "outbox-worker",
      error: err.message,
      message: "Outbox processing failed"
    });
  }
};

/**
 * Start worker loop
 */
const startOutboxWorker = () => {
  logger.info({
    service: "outbox-worker",
    interval: "5 seconds",
    message: "Outbox Worker started"
  });

  setInterval(processOutbox, 5000);
};

export default startOutboxWorker;

startOutboxWorker();