import IORedis from "ioredis";
import config from "./env.js";

const connection = new IORedis(config.redisUrl, {
  maxRetriesPerRequest: null,

  // Keep the Redis connection alive during long-running worker usage
  keepAlive: 10000,

  // Fail connection establishment reasonably quickly
  connectTimeout: 10000,

  // Explicitly check Redis readiness before commands are processed
  enableReadyCheck: true
});

export default connection;