import sendEmail from "../services/emailService.js";
import sendNotification from "../services/notificationService.js";
import trackEvent from "../services/analyticsService.js";
import logger from "../utils/logger.js";
import ProcessedEvent from "../models/ProcessedEvent.js";

const signupHandler = async (payload, context) => {
  const { correlationId, eventType, eventId } = context;

  const alreadyProcessed = await ProcessedEvent.findOne({ eventId });

  if (alreadyProcessed) {
    logger.info({
      correlationId,
      handler: "signup-handler",
      message: "Duplicate event skipped (idempotent guard)",
      eventId
    });
    return;
  }

  logger.info({
    correlationId,
    handler: "signup-handler",
    eventType,
    userId: payload.userId,
    email: payload.email,
    message: "Processing signup event"
  });

  await sendEmail(payload.email, "Welcome to our platform", context);

  await sendNotification("New user signed up", context);

  await trackEvent({
    eventType: "USER_SIGNUP",
    status: "SUCCESS",
    correlationId,
    timestamp: new Date()
  });

  await ProcessedEvent.create({
    eventId,
    type: eventType
  });
};

export default signupHandler;