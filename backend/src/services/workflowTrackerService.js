import WorkflowExecution
from "../models/WorkflowExecution.js";

export async function getRecentWorkflows() {

  return WorkflowExecution
    .find()
    .sort({ createdAt: -1 })
    .limit(5);

}