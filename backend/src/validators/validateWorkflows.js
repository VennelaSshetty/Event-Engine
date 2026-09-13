import workflows from "../config/workflows.js";
import registry from "../utils/handlerRegistry.js";

export default function validateWorkflows() {

  for (const [workflowName, workflow] of Object.entries(workflows)) {

    for (const stage of workflow.sequence) {

      for (const action of stage) {

        if (!registry[action]) {
          throw new Error(
            `Workflow "${workflowName}" contains unknown action "${action}"`
          );
        }

      }

    }

  }

}