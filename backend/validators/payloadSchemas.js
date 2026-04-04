// payloadSchemas.js
import Joi from "joi";
import { EVENT_TYPES } from "../config/eventTypes.js";

export const payloadSchemas = {
  [EVENT_TYPES.USER_SIGNUP]: Joi.object({
    userId: Joi.string()
      .pattern(/^user_\d+$/)
      .required()
      .messages({
        "string.pattern.base": "User ID must be like user_123",
        "string.empty": "User ID is required"
      }),
    email: Joi.string()
      .email()
      .required()
      .messages({
        "string.email": "Email must be a valid email address",
        "string.empty": "Email is required"
      })
  }),

  [EVENT_TYPES.ORDER_CREATED]: Joi.object({
    orderId: Joi.string()
      .pattern(/^order_\d+$/)
      .required()
      .messages({
        "string.pattern.base": "Order ID must be like order_101",
        "string.empty": "Order ID is required"
      }),
    amount: Joi.number()
      .positive()
      .required()
      .messages({
        "number.positive": "Amount must be a positive number",
        "any.required": "Amount is required"
      })
  }),

  [EVENT_TYPES.PAYMENT_SUCCESS]: Joi.object({
    paymentId: Joi.string()
      .pattern(/^pay_\d+$/)
      .required()
      .messages({
        "string.pattern.base": "Payment ID must be like pay_456",
        "string.empty": "Payment ID is required"
      }),
    orderId: Joi.string()
      .pattern(/^order_\d+$/)
      .required()
      .messages({
        "string.pattern.base": "Order ID must be like order_101",
        "string.empty": "Order ID is required"
      })
  })
};