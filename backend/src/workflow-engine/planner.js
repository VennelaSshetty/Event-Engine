import { getWorkflow } from "./index.js";

export async function createPlan(eventType, version) {

  const workflow = await getWorkflow(eventType, version);

  if (!workflow) {
    throw new Error(
      `No workflow found for ${eventType} version ${version}`
    );
  }

  return workflow.sequence.map(group => ({
    type: group.length > 1
      ? "parallel"
      : "sequential",

    actions: group
  }));
}