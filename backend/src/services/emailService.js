import nodemailer from "nodemailer";
import AppError from "../utils/AppError.js";
import logger from "../utils/logger.js";
import config from "../config/env.js";

const transporter = nodemailer.createTransport({
  host: config.mailHost,
  port: config.mailPort,
  auth: {
    user: config.mailUser,
    pass: config.mailPass
  }
});

const sendEmail = async (to, subject, context = {}) => {
  if (!to || !subject) {
    throw new AppError("Email or subject missing", 400, false);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(to)) {
    throw new AppError("Invalid email format", 400, false);
  }

  if (!config.mailEnabled) {
  logger.info({
    correlationId: context.correlationId,
    service: "email-service",
    email: to,
    subject,
    status: "EMAIL_DISABLED",
    message: "Email sending disabled"
  });

  return;
}

  try {
    const info = await transporter.sendMail({
  from: config.mailFrom,
  to,
  subject,
  text: `Event Engine notification: ${subject}`,
  headers: {
    "X-Correlation-ID": context.correlationId
  }
});

    logger.info({
      correlationId: context.correlationId,
      service: "email-service",
      email: to,
      subject,
      messageId: info.messageId,
      status: "EMAIL_SENT",
      message: "Email sent successfully"
    });

    return info;
  } catch (err) {
    logger.error({
      correlationId: context.correlationId,
      service: "email-service",
      email: to,
      subject,
      status: "EMAIL_FAILED",
      error: err.message
    });

    throw new AppError(
      "Email service temporarily unavailable",
      503,
      true
    );
  }
};

export default sendEmail;