import mongoose from "mongoose";

const processedEventSchema = new mongoose.Schema(
  {
    eventId: { type: String, required: true, unique: true },
    type: { type: String },
    status: { type: String, default: "DONE" },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model("ProcessedEvent", processedEventSchema);