import sendNotificationService from "../services/notificationService.js";
import AppError from "../utils/AppError.js";

export default async function sendNotification({
  email }, context = {}) {

  await new Promise(resolve => setTimeout(resolve, 10000));
  
  if (!email) {
    throw new AppError(
      "Email is required for notification",
      400,
      false
    );
  }

  await sendNotificationService(
    `Payment notification for ${email}`,
    {
      ...context,
      email
    }
  );
}