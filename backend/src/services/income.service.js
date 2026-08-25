const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');
const { parsePagination, buildMeta } = require('../utils/pagination');
const { resolveDateRange } = require('../utils/dateRange');

function buildWhere(userId, query) {
  const where = { userId };
  if (query.search) where.description = { contains: query.search, mode: 'insensitive' };
  if (query.source) where.source = query.source;
  if (query.month || query.startDate || query.endDate) {
    const { start, end } = resolveDateRange(query);
    where.date = { gte: start, lte: end };
  }
  return where;
}

async function listIncome(userId, query) {
  const { page, limit, skip, take } = parsePagination(query);
  const where = buildWhere(userId, query);
  const orderBy = { [query.sortBy || 'date']: query.sortOrder || 'desc' };

  const [incomes, total] = await Promise.all([
    prisma.income.findMany({ where, orderBy, skip, take }),
    prisma.income.count({ where }),
  ]);

  return { incomes, meta: buildMeta({ page, limit, total }) };
}

async function getIncome(userId, id) {
  const income = await prisma.income.findFirst({ where: { id, userId } });
  if (!income) throw new AppError('Income record not found.', 404);
  return income;
}

async function createIncome(userId, data) {
  return prisma.income.create({ data: { ...data, userId } });
}

async function updateIncome(userId, id, data) {
  const income = await prisma.income.findFirst({ where: { id, userId } });
  if (!income) throw new AppError('Income record not found.', 404);
  return prisma.income.update({ where: { id }, data });
}

async function deleteIncome(userId, id) {
  const income = await prisma.income.findFirst({ where: { id, userId } });
  if (!income) throw new AppError('Income record not found.', 404);
  await prisma.income.delete({ where: { id } });
}

module.exports = { listIncome, getIncome, createIncome, updateIncome, deleteIncome, buildWhere };
