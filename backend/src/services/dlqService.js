import Event from "../models/Event.js";

export async function getFailedEvents() {

  return Event.find({
    isInDLQ: true
  })
  .sort({
    movedToDLQAt: -1
  });
}