import Event from "../models/Event.js";

export const createEventService = async (data) => {
  const event = new Event(data);
  return await event.save();
};

export const getEventsService = async (filter, page, limit) => {
  return await Event.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

export const getEventByIdService = async (id) => {
  return await Event.findById(id);
};