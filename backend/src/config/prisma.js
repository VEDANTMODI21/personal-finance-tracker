const { PrismaClient } = require('@prisma/client');

// Single shared Prisma Client instance across the app (recommended pattern
// to avoid exhausting DB connections in dev with hot-reloads).
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

module.exports = prisma;
