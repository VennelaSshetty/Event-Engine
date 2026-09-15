import workflows from "../config/workflows.js";
import registry from "../utils/handlerRegistry.js";

export default function validateWorkflows() {

  for (const [workflowName, versions] of Object.entries(workflows)) {

    for (const [version, workflow] of Object.entries(versions)) {

      for (const stage of workflow.sequence) {

        for (const action of stage) {

          if (!registry[action]) {
            throw new Error(
              `Workflow "${workflowName}" version "${version}" contains unknown action "${action}"`
            );
          }

        }

      }

    }

  }

}