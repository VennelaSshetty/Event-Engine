import registry from "../utils/handlerRegistry.js";

export async function executeStep(step) {
  const actionName = step.action;

  const action = registry[actionName];

  if (!action) {
    const err = new Error(`Action not found: ${actionName}`);
    err.failedAction = actionName;
    throw err;
  }

  try {
    const context = {
      ...step.context,
      payload: step.payload
    };

    return await action(step.payload, context);
  } catch (err) {
    err.failedAction = actionName;
    throw err;
  }
}