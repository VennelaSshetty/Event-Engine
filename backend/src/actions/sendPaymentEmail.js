import sendEmail from "../services/emailService.js";
import AppError from "../utils/AppError.js";

export default async function sendPaymentEmail(payload, context) {

  if (!payload?.email) {
    throw new AppError("Email missing", 400, false);
  }

  await sendEmail(
    payload.email,
    "Payment successful",
    context
  );
}

