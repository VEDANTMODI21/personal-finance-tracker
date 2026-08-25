/**
 * Operational error class carrying an HTTP status code. Thrown deliberately
 * from controllers/services so the central error middleware can format a
 * consistent { success:false, message } response instead of leaking a stack
 * trace to the client.
 */
class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
