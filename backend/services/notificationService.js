import logger from "../utils/logger.js";

const sendNotification = async (message, context = {}) => {
  logger.info({
    correlationId: context.correlationId,
    service: "notification-service",
    notificationMessage: message,
    status: "NOTIFICATION_SENT",
    message: "Notification sent successfully"
  });
};

export default sendNotification;