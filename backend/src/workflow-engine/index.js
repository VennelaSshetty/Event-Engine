import { fetchWorkflow } from "../services/workflowCache.service.js";

export async function getWorkflow(eventType) {

  return await fetchWorkflow(eventType);
}