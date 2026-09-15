const workflows = {

  USER_SIGNUP: {
     1: {
    sequence: [
      ["sendWelcomeEmail"],
      ["sendNotification"],
      ["trackAnalytics"]
    ]
  },

  2: {
    sequence: [
      ["sendWelcomeEmail"],
      ["trackAnalytics"]
    ]
  }
  },

  ORDER_CREATED: {
    1: {
      sequence: [
        ["sendOrderEmail", "sendNotification"],
        ["trackAnalytics"]
      ]
    }
  },

  PAYMENT_SUCCESS: {
    1: {
      sequence: [
        ["updateOrderStatus"],
        ["sendPaymentEmail", "sendNotification"],
        ["trackAnalytics"]
      ]
    }
  }
};

export const CURRENT_VERSION = 1;

export default workflows;