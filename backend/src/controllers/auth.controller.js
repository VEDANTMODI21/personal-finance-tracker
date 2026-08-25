const catchAsync = require('../utils/catchAsync');
const { success } = require('../utils/apiResponse');
const authService = require('../services/auth.service');
const env = require('../config/env');

const REFRESH_COOKIE_NAME = 'refreshToken';
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.isProd,
  sameSite: env.isProd ? 'none' : 'lax',
  maxAge: 30 * 24 * 60 * 60 * 1000,
  path: '/api/auth',
};

function setRefreshCookie(res, token) {
  res.cookie(REFRESH_COOKIE_NAME, token, REFRESH_COOKIE_OPTIONS);
}

const register = catchAsync(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.register(req.body);
  setRefreshCookie(res, refreshToken);
  success(res, { user, accessToken }, 201);
});

const login = catchAsync(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body);
  setRefreshCookie(res, refreshToken);
  success(res, { user, accessToken });
});

const logout = catchAsync(async (req, res) => {
  const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
  await authService.logout(refreshToken);
  res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/auth' });
  success(res, { message: 'Logged out successfully.' });
});

const refresh = catchAsync(async (req, res) => {
  const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME] || req.body?.refreshToken;
  const { accessToken, user } = await authService.refreshAccessToken(refreshToken);
  success(res, { accessToken, user });
});

const me = catchAsync(async (req, res) => {
  const user = await authService.getCurrentUser(req.user.id);
  success(res, { user });
});

const changePassword = catchAsync(async (req, res) => {
  await authService.changePassword(req.user.id, req.body);
  success(res, { message: 'Password changed successfully. Please log in again on other devices.' });
});

const forgotPassword = catchAsync(async (req, res) => {
  const { rawToken } = await authService.forgotPassword(req.body.email);
  // In production this token would be emailed to the user. Since this app
  // has no email service configured, we return it directly in dev/test so
  // the flow remains fully testable end-to-end.
  success(res, {
    message: 'If an account with that email exists, a reset link has been generated.',
    ...(env.isProd ? {} : { resetToken: rawToken }),
  });
});

const resetPassword = catchAsync(async (req, res) => {
  const { token, newPassword } = req.body;
  await authService.resetPassword(token, newPassword);
  success(res, { message: 'Password has been reset. Please log in with your new password.' });
});

module.exports = { register, login, logout, refresh, me, changePassword, forgotPassword, resetPassword };
