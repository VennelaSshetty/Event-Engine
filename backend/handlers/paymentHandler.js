import sendEmail from "../services/emailService.js";
import sendNotification from "../services/notificationService.js";
import trackEvent from "../services/analyticsService.js";
import logger from "../utils/logger.js";
import ProcessedEvent from "../models/ProcessedEvent.js";

const paymentHandler = async (payload, context) => {
  const { correlationId, eventType, eventId } = context;

  const alreadyProcessed = await ProcessedEvent.findOne({ eventId });

  if (alreadyProcessed) {
    logger.info({
      correlationId,
      handler: "payment-handler",
      message: "Duplicate event skipped (idempotent guard)",
      eventId
    });
    return;
  }

  logger.info({
    correlationId,
    handler: "payment-handler",
    eventType,
    paymentId: payload.paymentId,
    message: "Processing payment event"
  });

  await sendEmail(payload.email, "Payment successful", context);

  await sendNotification(
    `Payment successful for order: ${payload.orderId}`,
    context
  );

  await trackEvent({
    eventType: "PAYMENT_SUCCESS",
    status: "SUCCESS",
    correlationId,
    timestamp: new Date()
  });

  await ProcessedEvent.create({
    eventId,
    type: eventType
  });
};

export default paymentHandler;