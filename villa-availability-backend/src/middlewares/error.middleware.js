// Simple application error class to carry HTTP status codes.
// Use this for predictable 4xx/5xx responses (e.g. validation errors, not-found).
class AppError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

// Centralized error handler – must be the last middleware.
// Ensures we always send a well-formed JSON error response:
// - 400 for invalid input (thrown via AppError)
// - 404 for not found (thrown via AppError)
// - 500 for all other unexpected errors
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status = err.statusCode || err.status || 500;
  const message =
    err.message || 'Something went wrong while processing your request';

  // In a real app you might plug in a logger here
  // console.error(err);

  res.status(status).json({
    error: {
      message,
    },
  });
}

module.exports = {
  AppError,
  errorHandler,
};


