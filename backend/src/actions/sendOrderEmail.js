import sendEmail from "../services/emailService.js";
import AppError from "../utils/AppError.js";

export default async function sendOrderEmail(payload, ctx) {

  if (!payload?.email) {
    throw new AppError("Email missing for order", 400, false);
  }

  await sendEmail(
    payload.email,
    "Order placed successfully",
    ctx
  );
}