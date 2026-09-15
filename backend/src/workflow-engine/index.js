import workflows from "../config/workflows.js";

export async function getWorkflow(eventType, version) {

  const workflowVersions = workflows[eventType];

  if (!workflowVersions) {
    return null;
  }

  return workflowVersions[version] || null;
}