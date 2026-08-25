const prisma = require('../config/prisma');
const { sanitizeUser } = require('./auth.service');

async function updateSettings(userId, data) {
  const user = await prisma.user.update({ where: { id: userId }, data });
  return sanitizeUser(user);
}

module.exports = { updateSettings };
