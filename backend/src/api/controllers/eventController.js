import Event from "../../models/Event.js";
import { eventSchema } from "../../validators/eventValidator.js";

import {
  createEventService,
  getEventsService,
  getEventByIdService
} from "../../services/event.service.js";

import AppError from "../../utils/AppError.js";

// --------------------
// GET EVENTS
// --------------------
export const getEvents = async (req, res) => {

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const filter = {};

  if (req.query.type) {
    filter.type = req.query.type;
  }

  const events = await getEventsService(filter, page, limit);

  res.status(200).json({
    success: true,
    data: events
  });
};

// --------------------
// CREATE EVENT
// --------------------
export const createEvent = async (req, res) => {

  const { error, value } = eventSchema.validate(req.body);

  if (error) {
    throw new AppError(
      error.details[0].message,
      400
    );
  }

  const { type, payload, idempotencyKey } = value;

  try {

    const event = await createEventService({
      type,
      payload,
      idempotencyKey,
      appName: req.client.appName,
      correlationId: req.correlationId
    });

    return res.status(201).json({
      success: true,
      data: event
    });

  } catch (err) {

    // Idempotency duplicate handling
    if (err.code === 11000) {

      const existingEvent = await Event.findOne({
        idempotencyKey: req.body.idempotencyKey
      });

      return res.status(200).json({
        success: true,
        data: existingEvent
      });
    }

    throw err;
  }
};

// --------------------
// GET EVENT BY ID
// --------------------
export const getEventById = async (req, res) => {

  const event = await getEventByIdService(req.params.id);

  res.status(200).json({
    success: true,
    data: event
  });
};