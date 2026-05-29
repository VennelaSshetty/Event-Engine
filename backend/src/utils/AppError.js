class AppError extends Error {

  constructor(message, statusCode, isRetryable = true) {

    super(message);

    this.statusCode = statusCode;

    this.status =
      `${statusCode}`.startsWith("4")
        ? "fail"
        : "error";

    this.isOperational = true;

    // IMPORTANT
    this.isRetryable = isRetryable;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;