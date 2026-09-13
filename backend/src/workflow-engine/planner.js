import { getWorkflow } from "./index.js";

export async function createPlan(eventType) {

  const workflow = await getWorkflow(eventType);

  if (!workflow) {
    throw new Error(`No workflow found for ${eventType}`);
  }

  return workflow.sequence.map(group => ({
    type: group.length > 1
      ? "parallel"
      : "sequential",

    actions: group
  }));
}