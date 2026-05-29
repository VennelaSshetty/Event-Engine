import mongoose from "mongoose";

const workflowExecutionSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      unique: true
    },

    workflowName: {
      type: String,
      required: true
    },

    status: {
      type: String,
      enum: [
        "processing",
        "completed",
        "failed"
      ],
      default: "processing"
    },

    completedActions: [
      {
        type: String
      }
    ],

    failedAction: {
      type: String
    },

    correlationId: {
      type: String,
      required: true
    },

    startedAt: {
      type: Date,
      default: Date.now
    },

    completedAt: Date,

    failedAt: Date
  },
  {
    timestamps: true
  }
);

export default mongoose.model(
  "WorkflowExecution",
  workflowExecutionSchema
);