import sendOrderEmail from "../actions/sendOrderEmail.js";
import sendPaymentEmail from "../actions/sendPaymentEmail.js";
import sendNotification from "../actions/sendNotification.js";
import trackAnalytics from "../actions/trackAnalytics.js";
import updateOrderStatus from "../actions/updateOrderStatus.js";

import sendWelcomeEmail from "../actions/sendWelcomeEmail.js";

const registry = {
  sendOrderEmail,
  sendPaymentEmail,
  sendNotification,
  trackAnalytics,
  updateOrderStatus,
  sendWelcomeEmail
};

export default registry;