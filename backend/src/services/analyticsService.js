import AppError from "../utils/AppError.js";
import logger from "../utils/logger.js";
import AnalyticsEvent from "../models/AnalyticsEvent.js";

const trackEvent = async (data) => {
  try {
    if (!data.eventType) {
      throw new AppError("Missing eventType", 400, false);
    }

    if (!data.correlationId) {
      throw new AppError("Missing correlationId", 400, false);
    }

    const analyticsEvent = await AnalyticsEvent.create({
      eventType: data.eventType,
      status: data.status,
      correlationId: data.correlationId,
      timestamp: data.timestamp || new Date()
    });

    logger.info({
      correlationId: data.correlationId,
      service: "analytics-service",
      analyticsEventId: analyticsEvent._id,
      eventType: data.eventType,
      status: data.status,
      message: "Analytics event persisted successfully"
    });

    return analyticsEvent;

  } catch (err) {
    logger.error({
      correlationId: data.correlationId,
      service: "analytics-service",
      message: "Analytics tracking failed",
      error: err.message
    });

    // Analytics failure should NOT break the workflow
    return;
  }
};

export default trackEvent;