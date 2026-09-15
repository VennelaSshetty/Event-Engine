import AppError from "../utils/AppError.js";
import logger from "../utils/logger.js";
import Notification from "../models/Notification.js";

const sendNotification = async (message, context = {}) => {
  if (!message || typeof message !== "string") {
    throw new AppError("Invalid notification message", 400, false);
  }

  if (!context.email) {
    throw new AppError("Email missing for notification", 400, false);
  }

  try {
    const notification = await Notification.create({
      email: context.email,
      message,
      correlationId: context.correlationId,
      status: "SENT"
    });

    logger.info({
      correlationId: context.correlationId,
      service: "notification-service",
      notificationId: notification._id,
      email: context.email,
      status: "NOTIFICATION_SENT",
      message: "Notification persisted successfully"
    });

    return notification;
  } catch (err) {
    logger.error({
      correlationId: context.correlationId,
      service: "notification-service",
      status: "NOTIFICATION_FAILED",
      error: err.message
    });

    throw new AppError(
      "Notification service temporarily unavailable",
      503,
      true
    );
  }
};

export default sendNotification;