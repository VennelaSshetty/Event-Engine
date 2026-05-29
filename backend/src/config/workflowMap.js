const workflowMap = {
  USER_SIGNUP: {
    mode: "sequential",
    steps: [
      "sendWelcomeEmail",
      "sendNotification",
      "trackAnalytics"
    ]
  },

  ORDER_CREATED: {
    mode: "sequential",
    steps: [
      "sendOrderEmail",
      "sendNotification",
      "trackAnalytics"
    ]
  },

  PAYMENT_SUCCESS: {
    mode: "parallel",
    steps: [
      "updateOrderStatus",
      "sendPaymentEmail",
      "sendNotification",
      "trackAnalytics"
    ]
  }
};

export default workflowMap;