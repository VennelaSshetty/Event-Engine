import logger from "../utils/logger.js";

const errorMiddleware = (err, req, res, next) => {

  logger.error({
    correlationId: req.correlationId,
    error: err.message,
    stack: err.stack,
    message: "Unhandled application error"
  });

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
};

export default errorMiddleware;