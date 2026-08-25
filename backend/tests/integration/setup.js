/**
 * Shared helpers for integration tests. These tests exercise the real
 * Express app against a live PostgreSQL test database through Prisma, so
 * they require `npx prisma generate` and `npx prisma migrate deploy` (or
 * `migrate dev`) to have been run first against DATABASE_URL from .env.test.
 */
const request = require('supertest');
const app = require('../../src/app');
const prisma = require('../../src/config/prisma');

async function resetDatabase() {
  // Order matters because of foreign keys.
  await prisma.loanPayment.deleteMany();
  await prisma.loan.deleteMany();
  await prisma.recurringExpense.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.income.deleteMany();
  await prisma.category.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
}

async function registerUser(overrides = {}) {
  const payload = {
    name: 'Test User',
    email: `user${Date.now()}${Math.random().toString(36).slice(2)}@example.com`,
    password: 'Password123!',
    confirmPassword: 'Password123!',
    ...overrides,
  };
  const res = await request(app).post('/api/auth/register').send(payload);
  return { res, payload };
}

async function createDefaultCategory(userId, name = 'Food') {
  return prisma.category.findFirst({ where: { userId, name } });
}

module.exports = { request, app, prisma, resetDatabase, registerUser, createDefaultCategory };
