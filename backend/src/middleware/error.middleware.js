const env = require('../config/env');

/* eslint-disable no-unused-vars */
function notFoundHandler(req, res, next) {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
}

function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  // Prisma known errors
  if (err.code === 'P2002') {
    statusCode = 409;
    const field = Array.isArray(err.meta?.target) ? err.meta.target.join(', ') : 'field';
    message = `A record with this ${field} already exists.`;
  } else if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Requested resource was not found.';
  } else if (err.code === 'P2003') {
    statusCode = 400;
    message = 'Related resource does not exist.';
  }

  if (err.name === 'ZodError') {
    statusCode = 422;
    message = err.errors?.[0]?.message || 'Validation failed.';
  }

  if (!err.isOperational && statusCode === 500) {
    // eslint-disable-next-line no-console
    console.error('[UNEXPECTED ERROR]', err);
    if (env.isProd) message = 'Something went wrong. Please try again later.';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(env.isProd ? {} : { stack: err.stack }),
  });
}

module.exports = { notFoundHandler, errorHandler };
