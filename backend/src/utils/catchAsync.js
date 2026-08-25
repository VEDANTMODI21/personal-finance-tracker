/**
 * Wraps an async Express handler so any rejected promise is forwarded to
 * next(err) instead of crashing the process / needing a try-catch in every
 * controller.
 */
module.exports = function catchAsync(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
