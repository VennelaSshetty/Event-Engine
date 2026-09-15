import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true
    },

    message: {
      type: String,
      required: true
    },

    correlationId: {
      type: String,
      required: true,
      index: true
    },

    status: {
      type: String,
      enum: ["SENT", "FAILED"],
      default: "SENT"
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Notification", notificationSchema);