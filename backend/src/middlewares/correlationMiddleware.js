import { generateCorrelationId } from "../utils/correlationId.js";

/**
 * Attaches a unique correlation ID to every request
 */
const correlationMiddleware = (req, res, next) => {
  const existingId = req.headers["x-correlation-id"];

  req.correlationId = existingId || generateCorrelationId();

  // Optional: send back to client (useful for debugging)
  res.setHeader("x-correlation-id", req.correlationId);

  next();
};

export default correlationMiddleware;