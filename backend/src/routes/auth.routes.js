const router = require('express').Router();
const controller = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { validateBody } = require('../middleware/validation.middleware');
const { authLimiter } = require('../middleware/rateLimiter');
const {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require('../validators/auth.validator');

router.post('/register', authLimiter, validateBody(registerSchema), controller.register);
router.post('/login', authLimiter, validateBody(loginSchema), controller.login);
router.post('/logout', controller.logout);
router.post('/refresh', controller.refresh);
router.get('/me', requireAuth, controller.me);
router.post('/change-password', requireAuth, validateBody(changePasswordSchema), controller.changePassword);
router.post('/forgot-password', authLimiter, validateBody(forgotPasswordSchema), controller.forgotPassword);
router.post('/reset-password', authLimiter, validateBody(resetPasswordSchema), controller.resetPassword);

module.exports = router;
