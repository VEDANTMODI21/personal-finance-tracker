const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');

/**
 * Recurring expenses (spec section 39, promoted as an advanced feature).
 * `generateDueExpenses` materializes actual Expense rows for any recurring
 * template whose next occurrence has passed. It is safe to call repeatedly
 * (e.g. on login, or from a scheduled job) since it advances lastRunDate as
 * it goes and never re-generates a period already run.
 */

function nextDate(date, frequency) {
  const d = new Date(date);
  switch (frequency) {
    case 'DAILY':
      d.setDate(d.getDate() + 1);
      break;
    case 'WEEKLY':
      d.setDate(d.getDate() + 7);
      break;
    case 'MONTHLY':
      d.setMonth(d.getMonth() + 1);
      break;
    case 'YEARLY':
      d.setFullYear(d.getFullYear() + 1);
      break;
    default:
      throw new Error(`Unknown frequency: ${frequency}`);
  }
  return d;
}

async function listRecurringExpenses(userId) {
  return prisma.recurringExpense.findMany({
    where: { userId },
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  });
}

async function createRecurringExpense(userId, data) {
  if (data.categoryId) {
    const category = await prisma.category.findFirst({ where: { id: data.categoryId, userId } });
    if (!category) throw new AppError('Selected category does not exist.', 400);
  }
  return prisma.recurringExpense.create({ data: { ...data, userId } });
}

async function updateRecurringExpense(userId, id, data) {
  const existing = await prisma.recurringExpense.findFirst({ where: { id, userId } });
  if (!existing) throw new AppError('Recurring expense not found.', 404);
  return prisma.recurringExpense.update({ where: { id }, data });
}

async function deleteRecurringExpense(userId, id) {
  const existing = await prisma.recurringExpense.findFirst({ where: { id, userId } });
  if (!existing) throw new AppError('Recurring expense not found.', 404);
  await prisma.recurringExpense.delete({ where: { id } });
}

async function generateDueExpenses(userId) {
  const templates = await prisma.recurringExpense.findMany({
    where: { userId, isActive: true, startDate: { lte: new Date() } },
  });

  const created = [];
  const now = new Date();

  for (const t of templates) {
    let cursor = t.lastRunDate ? nextDate(t.lastRunDate, t.frequency) : t.startDate;
    let lastRun = t.lastRunDate;

    while (cursor <= now && (!t.endDate || cursor <= t.endDate)) {
      if (t.categoryId) {
        // eslint-disable-next-line no-await-in-loop
        const expense = await prisma.expense.create({
          data: {
            userId,
            categoryId: t.categoryId,
            amount: t.amount,
            description: `${t.description} (auto-generated)`,
            date: cursor,
            paymentMethod: t.paymentMethod,
            notes: 'Generated from a recurring expense template.',
          },
        });
        created.push(expense);
      }
      lastRun = cursor;
      cursor = nextDate(cursor, t.frequency);
    }

    if (lastRun && lastRun !== t.lastRunDate) {
      // eslint-disable-next-line no-await-in-loop
      await prisma.recurringExpense.update({ where: { id: t.id }, data: { lastRunDate: lastRun } });
    }
  }

  return created;
}

module.exports = {
  listRecurringExpenses,
  createRecurringExpense,
  updateRecurringExpense,
  deleteRecurringExpense,
  generateDueExpenses,
  nextDate,
};
