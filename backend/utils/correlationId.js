import crypto from "crypto";

/**
 * Generates a unique correlation ID for request tracing
 */
export const generateCorrelationId = () => {
  return `corr-${crypto.randomUUID()}`;
};