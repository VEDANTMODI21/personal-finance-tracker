const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');
const { parsePagination, buildMeta } = require('../utils/pagination');
const { resolveDateRange } = require('../utils/dateRange');

function buildWhere(userId, query) {
  const where = { userId };

  if (query.search) {
    where.description = { contains: query.search, mode: 'insensitive' };
  }
  if (query.categoryId) where.categoryId = query.categoryId;
  if (query.paymentMethod) where.paymentMethod = query.paymentMethod;

  if (query.minAmount !== undefined || query.maxAmount !== undefined) {
    where.amount = {};
    if (query.minAmount !== undefined) where.amount.gte = query.minAmount;
    if (query.maxAmount !== undefined) where.amount.lte = query.maxAmount;
  }

  if (query.month || query.startDate || query.endDate) {
    const { start, end } = resolveDateRange(query);
    where.date = { gte: start, lte: end };
  }

  return where;
}

async function listExpenses(userId, query) {
  const { page, limit, skip, take } = parsePagination(query);
  const where = buildWhere(userId, query);

  const orderBy = { [query.sortBy || 'date']: query.sortOrder || 'desc' };

  const [expenses, total] = await Promise.all([
    prisma.expense.findMany({
      where,
      include: { category: { select: { id: true, name: true, color: true, icon: true } } },
      orderBy,
      skip,
      take,
    }),
    prisma.expense.count({ where }),
  ]);

  return { expenses, meta: buildMeta({ page, limit, total }) };
}

async function getExpense(userId, id) {
  const expense = await prisma.expense.findFirst({
    where: { id, userId },
    include: { category: true },
  });
  if (!expense) throw new AppError('Expense not found.', 404);
  return expense;
}

async function assertCategoryOwnership(userId, categoryId) {
  const category = await prisma.category.findFirst({ where: { id: categoryId, userId } });
  if (!category) throw new AppError('Selected category does not exist.', 400);
}

async function createExpense(userId, data) {
  await assertCategoryOwnership(userId, data.categoryId);
  return prisma.expense.create({
    data: { ...data, userId },
    include: { category: true },
  });
}

async function updateExpense(userId, id, data) {
  const expense = await prisma.expense.findFirst({ where: { id, userId } });
  if (!expense) throw new AppError('Expense not found.', 404);

  if (data.categoryId) await assertCategoryOwnership(userId, data.categoryId);

  return prisma.expense.update({
    where: { id },
    data,
    include: { category: true },
  });
}

async function deleteExpense(userId, id) {
  const expense = await prisma.expense.findFirst({ where: { id, userId } });
  if (!expense) throw new AppError('Expense not found.', 404);
  await prisma.expense.delete({ where: { id } });
}

module.exports = { listExpenses, getExpense, createExpense, updateExpense, deleteExpense, buildWhere };
