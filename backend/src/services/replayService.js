import Event from "../models/Event.js";
import eventQueue from "../queues/queue.js";
import logger from "../utils/logger.js";
import { EVENT_STATUS } from "../config/eventStatus.js";
import AppError from "../utils/AppError.js";

export async function replayEvent(eventId, reason = "manual replay") {

  // -------------------------
  // 1. FETCH EVENT
  // -------------------------
  const event = await Event.findById(eventId);

  if (!event) {
    throw new AppError("Event not found", 404, false);
  }

  // -------------------------
  // 2. SAFETY CHECK (IMPORTANT)
  // -------------------------
  if (event.status === EVENT_STATUS.PROCESSING) {
    throw new AppError(
      "Event is currently processing, cannot replay",
      409,
      false
    );
  }

  // optional safety rule
  if (event.status === EVENT_STATUS.PENDING) {
    throw new AppError(
      "Event is already pending, replay not needed",
      409,
      false
    );
  }

  // -------------------------
  // 3. RESET STATE SAFELY
  // -------------------------
event.status = EVENT_STATUS.PENDING;

event.startedAt = null;
event.completedAt = null;
event.failedAt = null;

  // -------------------------
  // 4. UPDATE REPLAY METADATA
  // -------------------------
  event.replayCount += 1;

  event.lastReplayedAt = new Date();

  event.replayHistory.push({
    replayedAt: new Date(),
    reason
  });

  await event.save();

  // -------------------------
  // 5. PUSH TO QUEUE (SAFE RETRY POLICY)
  // -------------------------
  await eventQueue.add(
    "process-event",
    {
    events: [
      {
        eventId: event._id,
        correlationId: event.correlationId
      }
    ],
    isReplay: true
  },
    {
      attempts: 5, // higher retry for replayed events
      backoff: {
        type: "exponential",
        delay: 2000
      },
      removeOnComplete: true,
      removeOnFail: false
    }
  );

  // -------------------------
  // 6. LOGGING
  // -------------------------
  logger.info({
    eventId,
    replayCount: event.replayCount,
    reason,
    status: "REPLAYED"
  });

  return event;
}