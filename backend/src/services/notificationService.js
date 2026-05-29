import AppError from "../utils/AppError.js";
import logger from "../utils/logger.js";

const sendNotification = async (message, context = {}) => {

  // 1. Validation
  if (!message || typeof message !== "string") {
    throw new AppError("Invalid notification message", 400, false);
  }

  try {
    // 2. REAL PLACE: integrate your actual provider here later
    // Example: await fcm.send(...), twilio.send(...)

    console.log("Sending notification:", message);

  } catch (err) {

    // 3. Retryable failure (infra issue)
    throw new AppError(
      "Notification service temporarily unavailable",
      503,
      true
    );
  }

  // 4. Success log
  logger.info({
    correlationId: context.correlationId,
    service: "notification-service",
    notificationMessage: message,
    status: "NOTIFICATION_SENT",
    message: "Notification sent successfully"
  });
};

export default sendNotification;