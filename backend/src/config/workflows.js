const workflows = {
  USER_SIGNUP: {
    sequence: [
      ["sendWelcomeEmail"],
      ["sendNotification"],
      ["trackAnalytics"]
    ]
  },

  ORDER_CREATED: {
    sequence: [
      ["sendOrderEmail", "sendNotification"],
      ["trackAnalytics"]
    ]
  },

  PAYMENT_SUCCESS: {
    sequence: [
      ["updateOrderStatus"],
      ["sendPaymentEmail", "sendNotification"],
      ["trackAnalytics"]
    ]
  }
};

export default workflows;