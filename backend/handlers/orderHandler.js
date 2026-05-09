import sendEmail from "../services/emailService.js";
import sendNotification from "../services/notificationService.js";
import trackEvent from "../services/analyticsService.js";
import logger from "../utils/logger.js";
import ProcessedEvent from "../models/ProcessedEvent.js";

const orderHandler = async (payload, context) => {
  const { correlationId, eventType, eventId } = context;

  //  IDEMPOTENCY CHECK
  const alreadyProcessed = await ProcessedEvent.findOne({ eventId });

  if (alreadyProcessed) {
    logger.info({
      correlationId,
      handler: "order-handler",
      message: "Duplicate event skipped (idempotent guard)",
      eventId
    });
    return;
  }

  logger.info({
    correlationId,
    handler: "order-handler",
    eventType,
    orderId: payload.orderId,
    message: "Processing order event"
  });

  await sendEmail(payload.email, "Order created successfully", context);

  await sendNotification(`Order created: ${payload.orderId}`, context);

  await trackEvent({
    eventType: "ORDER_CREATED",
    status: "SUCCESS",
    correlationId,
    timestamp: new Date()
  });

  // MARK AS PROCESSED
  await ProcessedEvent.create({
    eventId,
    type: eventType
  });
};

export default orderHandler;