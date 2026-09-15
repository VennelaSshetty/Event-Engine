import mongoose from "mongoose";

const analyticsEventSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      required: true,
      index: true
    },

    status: {
      type: String,
      required: true
    },

    correlationId: {
      type: String,
      required: true,
      index: true
    },

    timestamp: {
      type: Date,
      required: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model(
  "AnalyticsEvent",
  analyticsEventSchema
);