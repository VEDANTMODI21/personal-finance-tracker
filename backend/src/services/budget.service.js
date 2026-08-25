const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');
const { toNumber, sum } = require('../utils/money');

/**
 * Monthly budgets are an "Optional Future Feature" from the spec (section 39)
 * promoted into this build per the project's request for extra, professional
 * touches. A budget can be overall (categoryId = null) or per-category.
 */
async function listBudgets(userId, month) {
  const where = { userId };
  if (month) where.month = month;

  const budgets = await prisma.budget.findMany({
    where,
    include: { category: true },
    orderBy: { month: 'desc' },
  });

  if (!month) return budgets.map((b) => ({ ...b, limit: toNumber(b.limit) }));

  const [start, end] = monthBounds(month);
  const expenses = await prisma.expense.findMany({
    where: { userId, date: { gte: start, lte: end } },
  });

  return budgets.map((b) => {
    const relevant = b.categoryId
      ? expenses.filter((e) => e.categoryId === b.categoryId)
      : expenses;
    const spent = sum(relevant.map((e) => e.amount));
    const limit = toNumber(b.limit);
    return {
      ...b,
      limit,
      spent,
      remaining: Math.round((limit - spent) * 100) / 100,
      percentUsed: limit > 0 ? Math.round((spent / limit) * 1000) / 10 : 0,
      exceeded: spent > limit,
    };
  });
}

function monthBounds(month) {
  const [y, m] = month.split('-').map(Number);
  const start = new Date(Date.UTC(y, m - 1, 1));
  const end = new Date(Date.UTC(y, m, 0, 23, 59, 59, 999));
  return [start, end];
}

async function upsertBudget(userId, data) {
  if (data.categoryId) {
    const category = await prisma.category.findFirst({ where: { id: data.categoryId, userId } });
    if (!category) throw new AppError('Selected category does not exist.', 400);
  }

  return prisma.budget.upsert({
    where: {
      userId_categoryId_month: {
        userId,
        categoryId: data.categoryId ?? null,
        month: data.month,
      },
    },
    update: { limit: data.limit },
    create: { ...data, userId },
  });
}

async function deleteBudget(userId, id) {
  const budget = await prisma.budget.findFirst({ where: { id, userId } });
  if (!budget) throw new AppError('Budget not found.', 404);
  await prisma.budget.delete({ where: { id } });
}

module.exports = { listBudgets, upsertBudget, deleteBudget };
