import { Worker } from "bullmq";
import mongoose from "mongoose";
import connection from "../config/redis.js";
import config from "../config/env.js";
import { processDLQJob } from "../services/dlqService.js";
import logger from "../utils/logger.js";

await mongoose.connect(config.mongoUri);

logger.info({
  service: "dlq-worker",
  message: "DLQ Worker connected to MongoDB"
});

const dlqWorker = new Worker(
  "dead-letter-queue",

  async (job) => {

    logger.warn({
      jobId: job.id,
      payload: job.data,
      message: "DLQ job received"
    });

    await processDLQJob(job.data);
  },

 {
  connection,
  concurrency: 1,

   metrics: {
    maxDataPoints: 20160
  }
}
);

dlqWorker.on("completed", (job) => {

  logger.info({
    jobId: job.id,
    status: "DLQ_STORED"
  });

});

dlqWorker.on("failed", (job, err) => {

  logger.error({
    jobId: job?.id,
    error: err.message,
    status: "DLQ_WORKER_FAILED"
  });

});

const shutdown = async (signal) => {
  logger.info({
    service: "dlq-worker",
    signal,
    message: "Graceful shutdown initiated"
  });

  try {
    // Stop accepting new DLQ jobs and wait for active job to finish
    await dlqWorker.close();

    logger.info({
      service: "dlq-worker",
      message: "DLQ worker closed"
    });

    // Close MongoDB connection
    await mongoose.connection.close();

    logger.info({
      service: "dlq-worker",
      message: "MongoDB connection closed"
    });

    // Close Redis connection
    await connection.quit();

    logger.info({
      service: "dlq-worker",
      message: "Redis connection closed"
    });

    logger.info({
      service: "dlq-worker",
      message: "Graceful shutdown completed"
    });

    process.exit(0);
  } catch (err) {
    logger.error({
      service: "dlq-worker",
      error: err.message,
      message: "Graceful shutdown failed"
    });

    process.exit(1);
  }
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));