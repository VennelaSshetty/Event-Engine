export const logAllJobs = async (queue) => {
  const jobs = await queue.getJobs([
    "waiting",
    "active",
    "completed",
    "failed"
  ]);

  console.log("------ JOBS IN QUEUE ------");

  jobs.forEach(job => {
    console.log({
      id: job.id,
      name: job.name,
      data: job.data,
      state: job.finishedOn ? "completed" : "pending"
    });
  });
};