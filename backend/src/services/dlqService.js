import dlq from "../queues/dlq.js";

export async function getFailedEvents() {

  const jobs = await dlq.getJobs(["waiting", "failed", "delayed"]);

  return jobs.map(job => job.data);
}