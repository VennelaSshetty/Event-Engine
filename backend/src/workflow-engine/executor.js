import registry from "../utils/handlerRegistry.js";

export async function executeStep(step) {
  const actionName = step.action;

  const action = registry[actionName];

  if (!action) {
    throw new Error(`Action not found: ${actionName}`);
  }

  // ALWAYS PASS CONSISTENT STRUCTURE
  const context = {
    ...step.context,
    payload: step.payload
  };

  return await action(step.payload, context);
}