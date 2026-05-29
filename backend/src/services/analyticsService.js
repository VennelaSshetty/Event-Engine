import AppError from "../utils/AppError.js";
import logger from "../utils/logger.js";

const trackEvent = async (data) => {
  try {
    // simulate external API / DB call
    if (!data.eventType) {
      throw new AppError("Missing eventType", 400, false);
    }

    logger.info({
      correlationId: data.correlationId,
      service: "analytics-service",
      eventType: data.eventType,
      status: data.status,
      message: "Analytics event tracked"
    });

  } catch (err) {
    // IMPORTANT: analytics failure should NOT break workflow
    logger.error({
      correlationId: data.correlationId,
      message: "Analytics tracking failed",
      error: err.message
    });

    return; // swallow OR optional DLQ (depends system)
  }
};

export default trackEvent;