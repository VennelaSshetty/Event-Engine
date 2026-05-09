import Event from "../models/Event.js";
import { eventSchema } from "../validators/eventValidator.js";
import {
  createEventService,
  getEventsService,
  getEventByIdService
} from "../services/event.service.js";

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
    console.error("GET EVENTS ERROR:", err);
    res.status(500).json({ error: err.message });
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

    // Use SERVICE (transaction + outbox)
  const event = await createEventService({
  type,
  payload,
  idempotencyKey,
  appName: req.client.appName,
  correlationId: req.correlationId   // ADD THIS
});

    return res.status(201).json(event);

  } catch (err) {
    console.error("CREATE EVENT ERROR:", err);

    // ✅ Idempotency handling
    if (err.code === 11000) {
      const existingEvent = await Event.findOne({
        idempotencyKey: req.body.idempotencyKey
      });

      return res.status(200).json(existingEvent);
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