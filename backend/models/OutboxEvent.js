import mongoose from "mongoose";

const outboxSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true
  },
  eventType: {
    type: String,
    required: true
  },
  payload: {
    type: Object,
    required: true
  },
  status: {
    type: String,
    enum: ["PENDING", "SENT", "FAILED"],
    default: "PENDING"
  },
  retries: {
    type: Number,
    default: 0
  },
  lastError: {
    type: String
  },
  processedAt: {
    type: Date
  },
  correlationId: {
  type: String,
  required: true
}
}, { timestamps: true });

export default mongoose.model("OutboxEvent", outboxSchema);