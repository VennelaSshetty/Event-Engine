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