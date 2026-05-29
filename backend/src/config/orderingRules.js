const orderingRules = {
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
  },

  USER_SIGNUP: {
    sequence: [
      ["sendWelcomeEmail"],
      ["sendNotification"],
      ["trackAnalytics"]
    ]
  }
};

export default orderingRules;