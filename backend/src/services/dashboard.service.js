const prisma = require('../config/prisma');
const { resolveDateRange, monthLabel } = require('../utils/dateRange');
const { sum, toNumber, round2 } = require('../utils/money');
const { enrichLoan } = require('./loan.service');

const CATEGORY_ORDER = [
  'Food', 'Transport', 'Shopping', 'Bills', 'Entertainment',
  'Education', 'Health', 'Travel', 'Subscriptions', 'Rent', 'Other',
];

async function getDashboard(userId, query) {
  const { start, end } = resolveDateRange(query);

  const [expenses, incomes, allLoans, budgetUser, incomeToDateAgg, expensesToDateAgg] = await Promise.all([
    prisma.expense.findMany({
      where: { userId, date: { gte: start, lte: end } },
      include: { category: true },
      orderBy: { date: 'desc' },
    }),
    prisma.income.findMany({ where: { userId, date: { gte: start, lte: end } }, orderBy: { date: 'desc' } }),
    prisma.loan.findMany({ where: { userId }, include: { payments: true } }),
    prisma.user.findUnique({ where: { id: userId } }),
    // Balance is a running total, not a per-month figure — it should reflect
    // every rupee ever received/spent up through the end of the selected
    // month, not just what happened inside that month. Otherwise unspent
    // income from an earlier month (e.g. July) would simply vanish from the
    // balance the moment you switch to August.
    prisma.income.aggregate({ where: { userId, date: { lte: end } }, _sum: { amount: true } }),
    prisma.expense.aggregate({ where: { userId, date: { lte: end } }, _sum: { amount: true } }),
  ]);

  const totalIncome = sum(incomes.map((i) => i.amount));
  const totalExpenses = sum(expenses.map((e) => e.amount));

  const incomeToDate = toNumber(incomeToDateAgg._sum.amount);
  const expensesToDate = toNumber(expensesToDateAgg._sum.amount);
  // Loans given reduce cash on hand just like an expense would, and
  // repayments received add cash back — both need to be folded into the
  // running balance too, all-time through the end of the selected month.
  const loansGivenToDate = sum(
    allLoans.filter((l) => new Date(l.dateGiven) <= end).map((l) => l.amount),
  );
  const loansRepaidToDate = sum(
    allLoans.flatMap((l) => l.payments.filter((p) => new Date(p.paymentDate) <= end)).map((p) => p.amount),
  );
  const balance = round2(incomeToDate + loansRepaidToDate - expensesToDate - loansGivenToDate);

  const loansGivenInRange = allLoans.filter((l) => new Date(l.dateGiven) >= start && new Date(l.dateGiven) <= end);
  const totalLent = sum(loansGivenInRange.map((l) => l.amount));

  const paymentsInRange = allLoans.flatMap((l) =>
    l.payments.filter((p) => new Date(p.paymentDate) >= start && new Date(p.paymentDate) <= end),
  );
  const totalRepaidInRange = sum(paymentsInRange.map((p) => p.amount));

  const enrichedLoans = allLoans.map(enrichLoan);
  const outstandingLoans = sum(enrichedLoans.map((l) => l.remainingAmount));

  // Category breakdown
  const byCategory = {};
  for (const e of expenses) {
    const name = e.category?.name || 'Other';
    byCategory[name] = (byCategory[name] || 0) + toNumber(e.amount);
  }
  const categoryBreakdown = Object.entries(byCategory)
    .map(([name, total]) => ({
      name,
      total: Math.round(total * 100) / 100,
      percentage: totalExpenses > 0 ? Math.round((total / totalExpenses) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.total - a.total);

  // Payment method breakdown
  const byMethod = {};
  for (const e of expenses) {
    byMethod[e.paymentMethod] = (byMethod[e.paymentMethod] || 0) + toNumber(e.amount);
  }
  const paymentMethodBreakdown = Object.entries(byMethod).map(([method, total]) => ({
    method,
    total: Math.round(total * 100) / 100,
  }));

  // Daily spending series
  const byDay = {};
  for (const e of expenses) {
    const key = new Date(e.date).toISOString().slice(0, 10);
    byDay[key] = (byDay[key] || 0) + toNumber(e.amount);
  }
  const dailySpending = Object.entries(byDay)
    .map(([date, total]) => ({ date, total: Math.round(total * 100) / 100 }))
    .sort((a, b) => (a.date > b.date ? 1 : -1));

  const largestExpenses = [...expenses]
    .sort((a, b) => toNumber(b.amount) - toNumber(a.amount))
    .slice(0, 5)
    .map((e) => ({
      id: e.id,
      description: e.description,
      amount: toNumber(e.amount),
      category: e.category?.name,
      date: e.date,
    }));

  const recentTransactions = buildRecentTransactions(expenses, incomes, loansGivenInRange, paymentsInRange).slice(0, 10);

  // Simple budget-alert check (advanced feature).
  let budgetAlert = null;
  if (budgetUser?.monthlyBudget) {
    const limit = toNumber(budgetUser.monthlyBudget);
    const pctUsed = limit > 0 ? Math.round((totalExpenses / limit) * 1000) / 10 : 0;
    budgetAlert = {
      limit,
      spent: totalExpenses,
      percentUsed: pctUsed,
      alertThreshold: budgetUser.budgetAlertPct,
      triggered: pctUsed >= budgetUser.budgetAlertPct,
      exceeded: totalExpenses > limit,
    };
  }

  return {
    range: { start, end, label: monthLabel(start) },
    summary: {
      income: totalIncome,
      expenses: totalExpenses,
      balance,
      loansGiven: totalLent,
      loansRepaid: totalRepaidInRange,
      outstandingLoans,
    },
    categoryBreakdown,
    paymentMethodBreakdown,
    dailySpending,
    largestExpenses,
    recentTransactions,
    budgetAlert,
    loanSummary: {
      totalOutstanding: outstandingLoans,
      overdueCount: enrichedLoans.filter((l) => l.status === 'OVERDUE').length,
      statusBreakdown: {
        PAID: enrichedLoans.filter((l) => l.status === 'PAID').length,
        PARTIALLY_PAID: enrichedLoans.filter((l) => l.status === 'PARTIALLY_PAID').length,
        OUTSTANDING: enrichedLoans.filter((l) => l.status === 'OUTSTANDING').length,
        OVERDUE: enrichedLoans.filter((l) => l.status === 'OVERDUE').length,
      },
    },
  };
}

function buildRecentTransactions(expenses, incomes, loans, payments) {
  const rows = [];
  for (const e of expenses) {
    rows.push({
      id: e.id,
      type: 'EXPENSE',
      date: e.date,
      description: e.description,
      category: e.category?.name,
      amount: -toNumber(e.amount),
    });
  }
  for (const i of incomes) {
    rows.push({
      id: i.id,
      type: 'INCOME',
      date: i.date,
      description: i.description || i.source,
      category: i.source,
      amount: toNumber(i.amount),
    });
  }
  for (const l of loans) {
    rows.push({
      id: l.id,
      type: 'LOAN_GIVEN',
      date: l.dateGiven,
      description: `Loan to ${l.personName}`,
      category: 'Loan',
      amount: -toNumber(l.amount),
    });
  }
  for (const p of payments) {
    rows.push({
      id: p.id,
      type: 'LOAN_REPAYMENT',
      date: p.paymentDate,
      description: 'Loan repayment received',
      category: 'Loan',
      amount: toNumber(p.amount),
    });
  }
  return rows.sort((a, b) => new Date(b.date) - new Date(a.date));
}

async function getTransactions(userId, query) {
  const { start, end } = resolveDateRange(query);
  const [expenses, incomes, loans] = await Promise.all([
    prisma.expense.findMany({ where: { userId, date: { gte: start, lte: end } }, include: { category: true } }),
    prisma.income.findMany({ where: { userId, date: { gte: start, lte: end } } }),
    prisma.loan.findMany({
      where: { userId },
      include: { payments: { where: { paymentDate: { gte: start, lte: end } } } },
    }),
  ]);

  const loansGivenInRange = loans.filter((l) => new Date(l.dateGiven) >= start && new Date(l.dateGiven) <= end);
  const paymentsInRange = loans.flatMap((l) => l.payments);

  const transactions = buildRecentTransactions(expenses, incomes, loansGivenInRange, paymentsInRange);

  let filtered = transactions;
  if (query.type) filtered = filtered.filter((t) => t.type === query.type);
  if (query.search) {
    const s = query.search.toLowerCase();
    filtered = filtered.filter((t) => t.description?.toLowerCase().includes(s));
  }

  return filtered;
}

module.exports = { getDashboard, getTransactions, CATEGORY_ORDER };
