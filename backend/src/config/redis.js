import IORedis from "ioredis";
import config from "./env.js";

const connection = new IORedis(
  config.redisUrl,
  {
    maxRetriesPerRequest: null
  }
);

export default connection;