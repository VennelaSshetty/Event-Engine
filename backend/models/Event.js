import mongoose from "mongoose";
import { EVENT_STATUS } from "../config/eventStatus.js";

const eventSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true
  },
  payload: {
    type: Object,
    required: true
  },
  idempotencyKey: {
      type: String,
      required: true,
      unique: true   
  },
  status: {
    type: String,
    enum: Object.values(EVENT_STATUS),
    default: EVENT_STATUS.PENDING
  }
 },
  { timestamps: true } 
);

export default mongoose.model("Event", eventSchema);