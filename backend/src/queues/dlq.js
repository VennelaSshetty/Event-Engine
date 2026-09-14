import { Queue } from "bullmq";
import connection from "../config/redis.js";

const dlq = new Queue("dead-letter-queue", {
  connection,

  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 100
  }
});

export default dlq;