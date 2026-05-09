import dotenv from "dotenv";

dotenv.config();

const config = {
  port: process.env.PORT || 5000,

  mongoUri: process.env.MONGO_URI,

  redisUrl: process.env.REDIS_URL,

  queueName: process.env.QUEUE_NAME || "event-queue",

  retryAttempts: Number(process.env.RETRY_ATTEMPTS) || 5,

  retryDelay: Number(process.env.RETRY_DELAY) || 5000,

  workerConcurrency: Number(process.env.WORKER_CONCURRENCY) || 5
};

export default config;