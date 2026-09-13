import Event from "../models/Event.js";
import { EVENT_STATUS } from "../config/eventStatus.js";
import logger from "../utils/logger.js";

export async function getFailedEvents() {

  return Event.find({
    isInDLQ: true
  }).sort({
    movedToDLQAt: -1
  });

}

export async function processDLQJob(jobData) {

  const {
    eventId,
    retryCount,
    error,
    failedAt
  } = jobData;

  const event = await Event.findById(eventId);

  const processingTime =
    event?.startedAt
      ? Date.now() - event.startedAt.getTime()
      : null;

  await Event.findByIdAndUpdate(
    eventId,
    {
      status: EVENT_STATUS.FAILED,
      retryCount,
      failedAt,
      isInDLQ: true,
      movedToDLQAt: new Date(),
      dlqReason: error,
      processingTimeMs: processingTime
    }
  );

  logger.info({
    eventId,
    retryCount,
    processingTimeMs: processingTime,
    message: "Event marked as DLQ in database"
  });

}