import { getFailedEvents } from "../../services/dlqService.js";
import { replayEvent  } from "../../services/replayService.js";

export const getDLQEvents = async (req, res) => {

  const events = await getFailedEvents();

  res.json({
    success: true,
    count: events.length,
    data: events
  });
};

export const replayEventFromDLQ  = async (req, res) => {

  const { eventId } = req.body;

await replayEvent(eventId);

  res.json({
    success: true,
    message: "Event replayed"
  });
};