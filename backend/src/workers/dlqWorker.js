import { Worker } from "bullmq";
import connection from "../config/redis.js";
import logger from "../utils/logger.js";

const dlqWorker = new Worker(
  "dead-letter-queue",

  async (job) => {

    logger.warn({
      jobId: job.id,
      payload: job.data,
      message: "Event stored in DLQ"
    });

  },

  {
    connection,
    concurrency: 1
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