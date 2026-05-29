import logger from "../utils/logger.js";
import AppError from "../utils/AppError.js";

export default async function sendNotification({ email }, context = {}) {
  throw new Error("FORCED_FAILURE_TEST");
  // -------------------------
  // VALIDATION LAYER
  // -------------------------
  if (!email) {
    throw new AppError(
      "Email is required for notification",
      400,
      false
    );
  }

  try {
    // -------------------------
    // REAL NOTIFICATION CALL (placeholder for provider)
    // -------------------------
    console.log(`Sending notification to ${email}`);

    // Example in real world:
    // await notificationProvider.sendEmail(email)

  } catch (err) {
    throw new AppError(
      "Notification service failed",
      503,
      true
    );
  }

  // -------------------------
  // LOGGING
  // -------------------------
  logger.info({
    correlationId: context.correlationId,
    service: "notification-service",
    email,
    status: "NOTIFICATION_SENT"
  });
}

