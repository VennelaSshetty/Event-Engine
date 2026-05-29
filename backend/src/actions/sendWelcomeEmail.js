import sendEmail from "../services/emailService.js";
import AppError from "../utils/AppError.js";

export default async function sendWelcomeEmail(payload, ctx) {

  if (!payload?.email) {
    throw new AppError("Email missing for welcome email", 400, false);
  }

  await sendEmail(
    payload.email,
    "Welcome to our platform ",
    ctx
  );
}