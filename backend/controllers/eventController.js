import Event from "../models/Event.js";
import { eventSchema, validatePayload } from "../validators/eventValidator.js";
import {
  createEventService,
  getEventsService,
  getEventByIdService
} from "../services/event.service.js";
import eventQueue from "../queue/queue.js";

// ✅ ADD THIS
import { logAllJobs } from "../debug/queueDebug.js";

export const getEvents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const filter = {};

    if (req.query.type) {
      filter.type = req.query.type;
    }

    const events = await getEventsService(filter, page, limit);

    res.json(events);

  } catch (err) {
    res.status(500).json({
      error: "Failed to fetch events"
    });
  }
};

export const createEvent = async (req, res) => {
  try {
    const { error, value } = eventSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        message: "Validation failed",
        details: error.details[0].message
      });
    }

    const { type, payload, idempotencyKey } = value;

    const event = new Event({
      type,
      payload,
      idempotencyKey
    });

    const savedEvent = await event.save();

    // 🔥 Add job to queue
    await eventQueue.add("process-event", {
      eventId: savedEvent._id.toString(),
      type: savedEvent.type,
      payload: savedEvent.payload
    });

    // 🔥 DEBUG: See jobs in terminal
    // await logAllJobs(eventQueue);

    return res.status(201).json(savedEvent);

  } catch (err) {
    console.error("CREATE EVENT ERROR:", err);

    if (err.code === 11000) {
      return res.status(409).json({
        message: "Duplicate event (idempotent request)"
      });
    }

    return res.status(500).json({
      message: err.message
    });
  }
};

export const getEventById = async (req, res) => {
  try {
    const event = await getEventByIdService(req.params.id);

    if (!event) {
      return res.status(404).json({
        error: "Event not found"
      });
    }

    res.json(event);

  } catch (err) {
    res.status(500).json({
      error: "Error fetching event"
    });
  }
};