import eventQueue from "../src/queues/queue.js";

async function cleanQueue() {

  console.log("Cleaning queue...");

  // Remove completed jobs
  await eventQueue.clean(0, 1000, "completed");

  // Remove failed jobs
  await eventQueue.clean(0, 1000, "failed");

  // Remove waiting jobs
  await eventQueue.clean(0, 1000, "wait");

  // Remove delayed jobs
  await eventQueue.clean(0, 1000, "delayed");

  console.log("Queue cleaned");

  process.exit(0);
}

cleanQueue();