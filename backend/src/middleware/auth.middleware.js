const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { verifyAccessToken } = require('../utils/tokens');
const prisma = require('../config/prisma');

/**
 * Verifies the JWT access token from the Authorization header and attaches
 * the authenticated user (id only, not the password hash) to req.user.
 *
 * Every downstream controller MUST scope its Prisma queries with
 * `where: { userId: req.user.id }` — the userId is NEVER trusted from the
 * request body/query, only from this verified token (spec section 6).
 */
const requireAuth = catchAsync(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw new AppError('Not authenticated. Please log in.', 401);
  }

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new AppError('Session expired. Please log in again.', 401);
    }
    throw new AppError('Invalid authentication token.', 401);
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) {
    throw new AppError('User no longer exists.', 401);
  }

  req.user = { id: user.id, name: user.name, email: user.email };
  next();
});

module.exports = { requireAuth };
