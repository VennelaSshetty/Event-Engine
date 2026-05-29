import mongoose from "mongoose";
import Event from "../models/Event.js";
import OutboxEvent from "../models/OutboxEvent.js";
import logger from "../utils/logger.js";
import AppError from "../utils/AppError.js";

export const createEventService = async (data) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const correlationId = data.correlationId || "unknown-correlation";

    // --------------------
    // 1. Create Event
    // --------------------
    const [event] = await Event.create(
      [
        {
          type: data.type,
          payload: data.payload,
          idempotencyKey: data.idempotencyKey,
          appName: data.appName,
          status: "pending",
          correlationId
        }
      ],
      { session }
    );

    logger.info({
      correlationId,
      service: "event-service",
      eventId: event._id,
      eventType: event.type,
      appName: event.appName,
      status: event.status,
      message: "Event created successfully"
    });

    // --------------------
    // 2. Create Outbox Entry
    // --------------------
    await OutboxEvent.create(
      [
        {
          eventId: event._id,
          eventType: data.type,
          payload: data.payload,
          status: "PENDING",
          correlationId
        }
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return event;

} catch (error) {
  await session.abortTransaction();
  session.endSession();

  logger.error({
    correlationId: data?.correlationId || "unknown-correlation",
    service: "event-service",
    error: error.message,
    message: "Event creation failed"
  });

  throw error instanceof AppError
    ? error
    : new AppError(error.message, 500, true);
}
};

// --------------------
// READ SERVICES (no change needed)
// --------------------
export const getEventsService = async (filter, page, limit) => {
  return await Event.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

export const getEventByIdService = async (id) => {

  const event = await Event.findById(id);

  if (!event) {
    throw new AppError("Event not found", 404);
  }

  return event;
};