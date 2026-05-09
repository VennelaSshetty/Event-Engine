import { Queue } from "bullmq";
import connection from "../config/redis.js";

const dlq = new Queue("dead-letter-queue", {
  connection
});

export default dlq;