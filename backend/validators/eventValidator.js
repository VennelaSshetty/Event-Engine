// eventValidator.js
import Joi from "joi";
import { EVENT_TYPES } from "../config/eventTypes.js";
import { payloadSchemas } from "./payloadSchemas.js";

export const eventSchema = Joi.object({
  type: Joi.string()
    .valid(...Object.values(EVENT_TYPES))
    .required()
    .trim()
    .messages({
      "any.only": `Type must be one of ${Object.values(EVENT_TYPES).join(", ")}`,
      "string.empty": "Event type is required"
    }),

  payload: Joi.alternatives().conditional("type", {
    switch: [
      { is: EVENT_TYPES.USER_SIGNUP, then: payloadSchemas[EVENT_TYPES.USER_SIGNUP] },
      { is: EVENT_TYPES.ORDER_CREATED, then: payloadSchemas[EVENT_TYPES.ORDER_CREATED] },
      { is: EVENT_TYPES.PAYMENT_SUCCESS, then: payloadSchemas[EVENT_TYPES.PAYMENT_SUCCESS] }
    ],
    otherwise: Joi.forbidden()
  }),

  idempotencyKey: Joi.string().required().messages({
    "string.empty": "Idempotency key is required"
  })
});

// Helper function to get clean message
export function validatePayload(type, payload) {
  const schema = payloadSchemas[type];
  if (!schema) throw new Error("Invalid event type");

  const { error } = schema.validate(payload, { abortEarly: false, allowUnknown: false });
  if (error) throw new Error(error.details.map(d => d.message).join(", "));
}