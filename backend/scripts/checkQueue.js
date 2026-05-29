import eventQueue from "../src/queues/queue.js";

const jobs = await eventQueue.getJobs([
  "waiting",
  "active",
  "completed",
  "failed",
  "delayed"
]);

for (const job of jobs) {
  console.log({
    id: job.id,
    name: job.name,
    data: job.data
  });
}

process.exit(0);