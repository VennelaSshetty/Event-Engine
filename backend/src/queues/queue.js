import { Queue } from "bullmq";
import connection from "../config/redis.js";
import config from "../config/env.js";

const eventQueue = new Queue(config.queueName, {
  connection,

  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 100
  }
});

export default eventQueue;