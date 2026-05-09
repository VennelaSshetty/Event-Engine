import { Worker } from "bullmq";
import mongoose from "mongoose";
import Event from "../models/Event.js";
import { EVENT_STATUS } from "../config/eventStatus.js";
import connection from "../config/redis.js";
import dlq from "../queues/dlq.js";

import signupHandler from "../handlers/signupHandler.js";
import orderHandler from "../handlers/orderHandler.js";
import paymentHandler from "../handlers/paymentHandler.js";

import logger from "../utils/logger.js";
import config from "../config/env.js";

// --------------------
// MongoDB connection
// --------------------
await mongoose.connect(config.mongoUri);

logger.info({
  service: "worker",
  message: "Worker connected to MongoDB"
});

// --------------------
// Worker
// --------------------
const worker = new Worker(
  "event-queue",
  async (job) => {
    const { type, payload, eventId, correlationId } = job.data;

    //  HARD CHECK (IMPORTANT)
    if (!correlationId) {
      throw new Error("Missing correlationId in job data");
    }

    logger.info({
      correlationId,
      jobId: job.id,
      eventId,
      eventType: type,
      retryCount: job.attemptsMade,
      status: "PROCESSING",
      message: "Job processing started"
    });

    try {
      const startedAt = new Date();

      const processingEvent = await Event.findByIdAndUpdate(
        eventId,
        {
          status: EVENT_STATUS.PROCESSING,
          startedAt,
          retryCount: job.attemptsMade
        },
        { returnDocument: "after" }
      );

      if (!processingEvent) {
        throw new Error("Event not found in DB");
      }

      logger.info({
        correlationId,
        jobId: job.id,
        eventId,
        eventType: type,
        status: EVENT_STATUS.PROCESSING,
        message: "Event marked as processing"
      });

      // --------------------
      // BUSINESS LOGIC
      // --------------------
      switch (type) {
        case "ORDER_CREATED":
          await orderHandler(payload, { correlationId, eventType: type, eventId });
          break;

        case "PAYMENT_SUCCESS":
          await paymentHandler(payload, { correlationId, eventType: type, eventId });
          break;

        case "USER_SIGNUP":
          await signupHandler(payload, { correlationId, eventType: type, eventId });
          break;

        default:
          throw new Error(`Unknown event type: ${type}`);
      }

      // --------------------
      // COMPLETED
      // --------------------
      const completedAt = new Date();
      const processingTimeMs = completedAt - startedAt;

      await Event.findByIdAndUpdate(eventId, {
        status: EVENT_STATUS.COMPLETED,
        completedAt,
        processingTimeMs
      });

      logger.info({
        correlationId,
        jobId: job.id,
        eventId,
        eventType: type,
        status: EVENT_STATUS.COMPLETED,
        processingTimeMs,
        retryCount: job.attemptsMade,
        message: "Event processed successfully"
      });

    } catch (err) {
      logger.error({
        correlationId,
        jobId: job.id,
        eventId,
        eventType: type,
        retryCount: job.attemptsMade + 1,
        status: EVENT_STATUS.FAILED,
        error: err.message,
        message: "Worker processing failed"
      });

      if (job.attemptsMade + 1 === job.opts.attempts) {
        await Event.findByIdAndUpdate(eventId, {
          status: EVENT_STATUS.FAILED,
          failedAt: new Date(),
          retryCount: job.attemptsMade + 1
        });
      }

      throw err;
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

worker.on("completed", (job) => {
  logger.info({
    correlationId: job.data.correlationId,
    jobId: job.id,
    status: "COMPLETED",
    message: "BullMQ completed event fired"
  });
});

worker.on("failed", async (job, err) => {
  const correlationId = job.data.correlationId;

  if (!correlationId) {
    logger.error({
      jobId: job?.id,
      error: "Missing correlationId",
      message: "Critical tracing failure"
    });
  }

  logger.error({
    correlationId,
    jobId: job?.id,
    error: err.message,
    status: "FAILED",
    message: "BullMQ failed event fired"
  });

  const eventId = job.data.eventId;

  const isRetryExhausted = job.attemptsMade === job.opts.attempts;
  const isStalledExceeded = err.message.includes("stalled");

  if (isRetryExhausted || isStalledExceeded) {
    await Event.findByIdAndUpdate(eventId, {
      status: EVENT_STATUS.FAILED,
      failedAt: new Date(),
      retryCount: job.attemptsMade
    });

    logger.warn({
      correlationId,
      jobId: job.id,
      eventId,
      eventType: job.data.type,
      status: EVENT_STATUS.FAILED,
      retryCount: job.attemptsMade,
      message: "Retries exhausted. Moving event to DLQ"
    });

    await dlq.add("failed-event", {
      correlationId,
      originalJobId: job.id,
      eventId,
      type: job.data.type,
      payload: job.data.payload,
      failedReason: err.message,
      failedAt: new Date()
    });
  }
});

worker.on("stalled", (jobId) => {
  logger.warn({
    jobId,
    status: "STALLED",
    message: "Job stalled and will be retried"
  });
});