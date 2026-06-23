import Event from "../../models/Event.js";
import WorkflowExecution from "../../models/WorkflowExecution.js";

export const getDashboardData = async (req, res) => {
  const events = await Event.find().sort({ createdAt: -1 }).limit(10);

  const totalEvents = await Event.countDocuments();

  const completed = await Event.countDocuments({
    status: "completed"
  });

  const processing = await Event.countDocuments({
    status: "processing"
  });

  const failed = await Event.countDocuments({
    status: "failed"
  });

  const avgResult = await Event.aggregate([
    {
      $match: {
        processingTimeMs: { $ne: null }
      }
    },
    {
      $group: {
        _id: null,
        avg: { $avg: "$processingTimeMs" }
      }
    }
  ]);

  const avgProcessingTime =
    avgResult.length > 0
      ? Math.round(avgResult[0].avg)
      : 0;

  const eventTypes = await Event.aggregate([
    {
      $group: {
        _id: "$type",
        count: { $sum: 1 }
      }
    }
  ]);

  const recentActivity = await WorkflowExecution
    .find()
    .sort({ createdAt: -1 })
    .limit(8);

  const timeline = events.map(event => ({
  time: new Date(event.createdAt).toLocaleTimeString(),
  status: event.status
}));

res.json({
  totalEvents,
  completed,
  processing,
  failed,
  avgProcessingTime,
  recentEvents: events,
  eventTypes,
  recentActivity,
  timeline
});
};