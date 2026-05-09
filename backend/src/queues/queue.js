import { Queue } from "bullmq";
import connection from "../config/redis.js";

import config from "../config/env.js";

const eventQueue = new Queue(config.queueName, {
  connection
});

export default eventQueue;