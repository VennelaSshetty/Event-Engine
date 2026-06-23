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

  appName: {
    type: String,
    required: true
  },

  status: {
    type: String,
    enum: Object.values(EVENT_STATUS),
    default: EVENT_STATUS.PENDING
  },

  startedAt: {
    type: Date,
    default: null
  },

  completedAt: {
    type: Date,
    default: null
  },

  failedAt: {
    type: Date,
    default: null
  },

  retryCount: {
    type: Number,
    default: 0
  },

  processingTimeMs: {
    type: Number,
    default: null
  },

  correlationId: {
    type: String,
    index: true
  },

  replayCount: {
  type: Number,
  default: 0
},

lastReplayedAt: {
  type: Date,
  default: null
},

replayHistory: [
  {
    replayedAt: Date,
    reason: String
  }
],

isInDLQ: {
  type: Boolean,
  default: false
},

dlqReason: {
  type: String,
  default: null
},

movedToDLQAt: {
  type: Date,
  default: null
}

}, { timestamps: true });

export default mongoose.model("Event", eventSchema);