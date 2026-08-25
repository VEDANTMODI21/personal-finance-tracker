const prisma = require('../config/prisma');
const { resolveDateRange, monthLabel } = require('../utils/dateRange');
const { sum, toNumber } = require('../utils/money');
const { enrichLoan } = require('./loan.service');
const AppError = require('../utils/AppError');

/**
 * Builds the full monthly report data model consumed by the dashboard-style
 * JSON endpoint as well as the PDF/Excel exporters, so all three always
 * agree on the numbers (spec sections 18, 20, 21).
 */
async function buildMonthlyReport(userId, month) {
  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    throw new AppError('A valid month (YYYY-MM) is required.', 400);
  }
  const { start, end } = resolveDateRange({ month });

  const [expenses, incomes, loans] = await Promise.all([
    prisma.expense.findMany({
      where: { userId, date: { gte: start, lte: end } },
      include: { category: true },
      orderBy: { date: 'asc' },
    }),
    prisma.income.findMany({ where: { userId, date: { gte: start, lte: end } }, orderBy: { date: 'asc' } }),
    prisma.loan.findMany({ where: { userId }, include: { payments: true } }),
  ]);

  const totalIncome = sum(incomes.map((i) => i.amount));
  const totalExpenses = sum(expenses.map((e) => e.amount));
  const balance = Math.round((totalIncome - totalExpenses) * 100) / 100;

  const loansGivenInRange = loans.filter((l) => new Date(l.dateGiven) >= start && new Date(l.dateGiven) <= end);
  const totalLoansGiven = sum(loansGivenInRange.map((l) => l.amount));

  const paymentsInRange = loans.flatMap((l) =>
    l.payments.filter((p) => new Date(p.paymentDate) >= start && new Date(p.paymentDate) <= end),
  );
  const totalLoansRepaid = sum(paymentsInRange.map((p) => p.amount));

  const enrichedLoans = loans.map(enrichLoan);
  const outstandingLoans = sum(enrichedLoans.map((l) => l.remainingAmount));

  const byCategory = {};
  for (const e of expenses) {
    const name = e.category?.name || 'Other';
    byCategory[name] = (byCategory[name] || 0) + toNumber(e.amount);
  }
  const expenseBreakdown = Object.entries(byCategory)
    .map(([category, total]) => ({
      category,
      total: Math.round(total * 100) / 100,
      percentage: totalExpenses > 0 ? Math.round((total / totalExpenses) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.total - a.total);

  const byMethod = {};
  for (const e of expenses) {
    byMethod[e.paymentMethod] = (byMethod[e.paymentMethod] || 0) + toNumber(e.amount);
  }
  const paymentMethodBreakdown = Object.entries(byMethod).map(([method, total]) => ({
    method,
    total: Math.round(total * 100) / 100,
  }));

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
    .slice(0, 10)
    .map((e) => ({
      description: e.description,
      category: e.category?.name,
      amount: toNumber(e.amount),
      date: e.date,
    }));

  const transactions = buildTransactions(expenses, incomes, loansGivenInRange, paymentsInRange);

  const loanSummaryRows = enrichedLoans.map((l) => ({
    personName: l.personName,
    amountGiven: l.amount,
    repaid: l.totalRepaid,
    outstanding: l.remainingAmount,
    status: l.status,
  }));

  return {
    month,
    monthLabel: monthLabel(start),
    range: { start, end },
    summary: {
      income: totalIncome,
      expenses: totalExpenses,
      balance,
      loansGiven: totalLoansGiven,
      loansRepaid: totalLoansRepaid,
      outstanding: outstandingLoans,
    },
    expenseBreakdown,
    paymentMethodBreakdown,
    dailySpending,
    largestExpenses,
    loanSummaryRows,
    transactions,
    rawExpenses: expenses,
    rawIncomes: incomes,
    rawLoans: enrichedLoans,
    rawPayments: paymentsInRange,
  };
}

function buildTransactions(expenses, incomes, loans, payments) {
  const rows = [];
  for (const e of expenses) {
    rows.push({ date: e.date, type: 'Expense', description: e.description, amount: -toNumber(e.amount) });
  }
  for (const i of incomes) {
    rows.push({ date: i.date, type: 'Income', description: i.description || i.source, amount: toNumber(i.amount) });
  }
  for (const l of loans) {
    rows.push({ date: l.dateGiven, type: 'Loan', description: `Loan to ${l.personName}`, amount: -toNumber(l.amount) });
  }
  for (const p of payments) {
    rows.push({ date: p.paymentDate, type: 'Loan', description: 'Loan repayment', amount: toNumber(p.amount) });
  }
  return rows.sort((a, b) => new Date(a.date) - new Date(b.date));
}

module.exports = { buildMonthlyReport };
