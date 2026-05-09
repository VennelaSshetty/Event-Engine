import logger from "../utils/logger.js";

const trackEvent = async (data) => {
  logger.info({
    correlationId: data.correlationId,
    service: "analytics-service",
    eventType: data.eventType,
    status: data.status,
    timestamp: data.timestamp,
    message: "Analytics event tracked"
  });
};

export default trackEvent;