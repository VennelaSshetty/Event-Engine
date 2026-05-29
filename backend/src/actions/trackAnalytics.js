import trackEvent from "../services/analyticsService.js";
import AppError from "../utils/AppError.js";

export default async function trackAnalytics(payload, ctx) {

  if (!ctx?.eventType) {
    throw new AppError("Event type missing for analytics", 400, false);
  }

  await trackEvent({
    eventType: ctx.eventType,
    status: "SUCCESS",
    correlationId: ctx.correlationId,
    timestamp: new Date()
  });
}