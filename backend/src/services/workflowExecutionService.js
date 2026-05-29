import WorkflowExecution from "../models/WorkflowExecution.js";

class WorkflowExecutionService {
  /*
   * Create or load workflow execution
   */
  static async startWorkflow({
    event,
    correlationId
  }) {
    // Check existing workflow execution

    let workflowExecution =
      await WorkflowExecution.findOne({
        eventId: event._id
      });

    // If workflow already exists
    // return existing one

    if (workflowExecution) {
      return workflowExecution;
    }

    // Create new workflow execution

    workflowExecution =
      await WorkflowExecution.create({
        eventId: event._id,
        workflowName: event.type,
        correlationId,
        status: "processing",
        completedActions: []
      });

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
        new: true
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
      await WorkflowExecution.findById(
        workflowExecutionId
      );

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
        new: true
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
        new: true
      }
    );
  }
}

export default WorkflowExecutionService;