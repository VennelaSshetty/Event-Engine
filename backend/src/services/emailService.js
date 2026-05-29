import AppError from "../utils/AppError.js";
import logger from "../utils/logger.js";

const sendEmail = async (to, subject, context = {}) => {

  // 1. Validation
  if (!to || !subject) {
    throw new AppError("Email or subject missing", 400, false);
  }

  // simple email format check (no libraries needed)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(to)) {
    throw new AppError("Invalid email format", 400, false);
  }

  try {
    // 2. REAL PLACE: SMTP / SES / SendGrid integration goes here
    console.log("Sending email to:", to);

  } catch (err) {

    // 3. Retryable (infra issue)
    throw new AppError(
      "Email service temporarily unavailable",
      503,
      true
    );
  }

  // 4. Success log
  logger.info({
    correlationId: context.correlationId,
    service: "email-service",
    email: to,
    subject,
    status: "EMAIL_SENT",
    message: "Email sent successfully"
  });
};

export default sendEmail;