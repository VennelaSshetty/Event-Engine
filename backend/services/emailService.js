import logger from "../utils/logger.js";

const sendEmail = async (to, subject, context = {}) => {
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