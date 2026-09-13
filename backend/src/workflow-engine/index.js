import workflows from "../config/workflows.js";

export async function getWorkflow(eventType) {
  return workflows[eventType] || null;
}