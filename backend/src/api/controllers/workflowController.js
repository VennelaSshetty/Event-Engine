import {
  getRecentWorkflows
}
from "../../services/workflowTrackerService.js";

export const getWorkflowTracker =
async (req, res) => {

  const workflows =
    await getRecentWorkflows();

  res.json({
    success: true,
    data: workflows
  });

};