import dlq from "../queues/dlq.js";

export async function getFailedEvents() {

  //const jobs = await dlq.getJobs(["waiting", "failed", "delayed"]);

  const jobs = await dlq.getJobs([
  "waiting",
  "failed",
  "delayed",
  "completed"
]);

  return jobs.map(job => job.data);
}