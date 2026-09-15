import WorkflowExecution from "../models/WorkflowExecution.js";
import { CURRENT_VERSION } from "../config/workflows.js";

class WorkflowExecutionService {
  /*
   * Create or load workflow execution
   */
static async startWorkflow({
  event,
  correlationId,
  currentVersion = CURRENT_VERSION
}) {

  const workflowExecution =
    await WorkflowExecution.findOneAndUpdate(
      {
        eventId: event._id
      },
      {
        $setOnInsert: {
  eventId: event._id,
  workflowName: event.type,
  workflowVersion: currentVersion,
  correlationId,
  status: "processing",
  completedActions: []
}
      },
      {
        upsert: true,
        returnDocument: "after",
        setDefaultsOnInsert: true
      }
    );

  // Existing failed workflow is being replayed
  if (workflowExecution.status === "failed") {

    workflowExecution.status = "processing";
    workflowExecution.failedAction = null;
    workflowExecution.failedAt = null;

    await workflowExecution.save();
  }

  return workflowExecution;
}

  /*
   * Mark action completed
   */
  static async markActionCompleted({
    workflowExecutionId,
    actionName
  }) {
    return WorkflowExecution.findByIdAndUpdate(
      workflowExecutionId,
      {
        $addToSet: {
          completedActions: actionName
        }
      },
      {
        returnDocument: "after"
      }
    );
  }

  /*
   * Check if action already completed
   */
  static async isActionCompleted({
    workflowExecutionId,
    actionName
  }) {
    const workflowExecution =
      await WorkflowExecution
      .findById(workflowExecutionId)
      .lean();

    if (!workflowExecution) {
      throw new Error(
        "Workflow execution not found"
      );
    }

    return workflowExecution.completedActions.includes(
      actionName
    );
  }

  /*
   * Mark workflow completed
   */
  static async markWorkflowCompleted(
    workflowExecutionId
  ) {
    return WorkflowExecution.findByIdAndUpdate(
      workflowExecutionId,
      {
        status: "completed",
        completedAt: new Date()
      },
      {
       returnDocument: "after"
      }
    );
  }

  /*
   * Mark workflow failed
   */
  static async markWorkflowFailed({
    workflowExecutionId,
    failedAction
  }) {
    return WorkflowExecution.findByIdAndUpdate(
      workflowExecutionId,
      {
        status: "failed",
        failedAction,
        failedAt: new Date()
      },
      {
        returnDocument: "after"
      }
    );
  }
}

export default WorkflowExecutionService;