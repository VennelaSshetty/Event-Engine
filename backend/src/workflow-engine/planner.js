import { getWorkflow } from "./index.js";
import orderingRules from "../config/orderingRules.js";

export async function createPlan(eventType, payload, context) {

  // -----------------------------
  // FETCH WORKFLOW
  // -----------------------------
  const workflow = await getWorkflow(eventType);

  if (!workflow) {
    throw new Error(`No workflow found for ${eventType}`);
  }

  // -----------------------------
  // ORDERING RULES
  // -----------------------------
  const rule = orderingRules[eventType];

  // fallback
  if (!rule) {

    return workflow.steps.map(action => ({
      type: "single",
      actions: [action],
      payload,
      context
    }));
  }

  // grouped execution
  return rule.sequence.map(group => ({
    type: group.length > 1
      ? "parallel"
      : "sequential",

    actions: group,
    payload,
    context
  }));
}