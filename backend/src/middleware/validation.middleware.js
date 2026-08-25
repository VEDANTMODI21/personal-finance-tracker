const { ZodError } = require('zod');

/**
 * Validates req.body (or req.query) against a Zod schema, replacing it with
 * the parsed/coerced value on success, or forwarding a 422 on failure.
 * Backend validation is authoritative — the frontend's own validation is
 * only a UX convenience (spec section 30).
 */
function validateBody(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(422).json({
          success: false,
          message: err.errors[0]?.message || 'Validation failed.',
          errors: err.errors.map((e) => ({ path: e.path.join('.'), message: e.message })),
        });
      }
      next(err);
    }
  };
}

function validateQuery(schema) {
  return (req, res, next) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(422).json({
          success: false,
          message: err.errors[0]?.message || 'Invalid query parameters.',
          errors: err.errors.map((e) => ({ path: e.path.join('.'), message: e.message })),
        });
      }
      next(err);
    }
  };
}

module.exports = { validateBody, validateQuery };
