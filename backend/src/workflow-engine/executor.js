import registry from "../utils/handlerRegistry.js";
import AppError from "../utils/AppError.js";

export async function executeStep(step) {
  const actionName = step.action;

  const action = registry[actionName];

  if (!action) {
   const err = new AppError(
  `Action not found: ${actionName}`,
  500,
  false
);

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