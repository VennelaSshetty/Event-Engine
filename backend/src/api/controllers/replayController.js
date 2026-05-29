import { replayEvent } from "../../services/replayService.js";

export const replayEventController = async (req, res) => {

  const { id } = req.params;

  const { reason } = req.body;

  const event = await replayEvent(id, reason);

  res.status(200).json({
    success: true,
    message: "Event replayed successfully",
    event
  });
};