const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');
const { parsePagination, buildMeta } = require('../utils/pagination');
const { computeLoanSummary, validateRepaymentAmount } = require('../utils/loanCalculations');
const { sum } = require('../utils/money');

/** Attaches computed totalRepaid/remainingAmount/status to a loan row. */
function enrichLoan(loan) {
  const { originalAmount, totalRepaid, remainingAmount, status } = computeLoanSummary(loan, loan.payments || []);
  return {
    ...loan,
    amount: originalAmount,
    totalRepaid,
    remainingAmount,
    status,
  };
}

function buildWhere(userId, query) {
  const where = { userId };
  if (query.search) where.personName = { contains: query.search, mode: 'insensitive' };
  if (query.startDate || query.endDate) {
    where.dateGiven = {};
    if (query.startDate) where.dateGiven.gte = query.startDate;
    if (query.endDate) where.dateGiven.lte = query.endDate;
  }
  if (query.dueBefore || query.dueAfter) {
    where.dueDate = {};
    if (query.dueAfter) where.dueDate.gte = query.dueAfter;
    if (query.dueBefore) where.dueDate.lte = query.dueBefore;
  }
  return where;
}

async function listLoans(userId, query) {
  const { page, limit, skip, take } = parsePagination(query);
  const where = buildWhere(userId, query);
  const orderBy = { [query.sortBy || 'dateGiven']: query.sortOrder || 'desc' };

  // Status is a computed field, so we fetch a candidate set (with payments),
  // enrich in JS, then filter/paginate by status in-memory. For typical
  // per-user loan volumes this is simpler and safer than replicating the
  // status formula in raw SQL.
  const all = await prisma.loan.findMany({
    where,
    include: { payments: { orderBy: { paymentDate: 'desc' } } },
    orderBy,
  });

  let enriched = all.map(enrichLoan);
  if (query.status) enriched = enriched.filter((l) => l.status === query.status);

  const total = enriched.length;
  const paged = enriched.slice(skip, skip + take);

  return { loans: paged, meta: buildMeta({ page, limit, total }) };
}

async function getLoan(userId, id) {
  const loan = await prisma.loan.findFirst({
    where: { id, userId },
    include: { payments: { orderBy: { paymentDate: 'desc' } } },
  });
  if (!loan) throw new AppError('Loan not found.', 404);
  return enrichLoan(loan);
}

async function createLoan(userId, data) {
  const loan = await prisma.loan.create({ data: { ...data, userId }, include: { payments: true } });
  return enrichLoan(loan);
}

async function updateLoan(userId, id, data) {
  const loan = await prisma.loan.findFirst({ where: { id, userId }, include: { payments: true } });
  if (!loan) throw new AppError('Loan not found.', 404);

  if (data.amount !== undefined) {
    const totalRepaid = sum(loan.payments.map((p) => p.amount));
    if (data.amount < totalRepaid) {
      throw new AppError(
        `Cannot reduce loan amount below the total already repaid (${totalRepaid}).`,
        400,
      );
    }
  }

  const updated = await prisma.loan.update({
    where: { id },
    data,
    include: { payments: { orderBy: { paymentDate: 'desc' } } },
  });
  return enrichLoan(updated);
}

async function deleteLoan(userId, id) {
  const loan = await prisma.loan.findFirst({ where: { id, userId } });
  if (!loan) throw new AppError('Loan not found.', 404);
  await prisma.loan.delete({ where: { id } });
}

async function addPayment(userId, loanId, data) {
  const loan = await prisma.loan.findFirst({ where: { id: loanId, userId }, include: { payments: true } });
  if (!loan) throw new AppError('Loan not found.', 404);

  const { remainingAmount } = computeLoanSummary(loan, loan.payments);
  const error = validateRepaymentAmount(data.amount, remainingAmount);
  if (error) throw new AppError(error, 400);

  await prisma.loanPayment.create({ data: { ...data, loanId } });
  return getLoan(userId, loanId);
}

async function listPayments(userId, loanId) {
  const loan = await prisma.loan.findFirst({ where: { id: loanId, userId } });
  if (!loan) throw new AppError('Loan not found.', 404);
  return prisma.loanPayment.findMany({ where: { loanId }, orderBy: { paymentDate: 'desc' } });
}

async function deletePayment(userId, loanId, paymentId) {
  const loan = await prisma.loan.findFirst({ where: { id: loanId, userId } });
  if (!loan) throw new AppError('Loan not found.', 404);
  const payment = await prisma.loanPayment.findFirst({ where: { id: paymentId, loanId } });
  if (!payment) throw new AppError('Payment not found.', 404);
  await prisma.loanPayment.delete({ where: { id: paymentId } });
  return getLoan(userId, loanId);
}

async function loanDashboard(userId) {
  const loans = await prisma.loan.findMany({ where: { userId }, include: { payments: true } });
  const enriched = loans.map(enrichLoan);

  const totalLent = sum(enriched.map((l) => l.amount));
  const totalRepaid = sum(enriched.map((l) => l.totalRepaid));
  const totalOutstanding = sum(enriched.map((l) => l.remainingAmount));
  const overdueAmount = sum(enriched.filter((l) => l.status === 'OVERDUE').map((l) => l.remainingAmount));

  const now = new Date();
  const soon = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const upcomingDue = enriched
    .filter((l) => l.status !== 'PAID' && l.dueDate && new Date(l.dueDate) >= now && new Date(l.dueDate) <= soon)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  const overdue = enriched.filter((l) => l.status === 'OVERDUE');

  const recentlyRepaid = enriched
    .filter((l) => l.payments.length > 0)
    .sort((a, b) => new Date(b.payments[0].paymentDate) - new Date(a.payments[0].paymentDate))
    .slice(0, 5);

  return {
    totalLent,
    totalRepaid,
    totalOutstanding,
    overdueAmount,
    upcomingDue,
    overdue,
    recentlyRepaid,
    statusBreakdown: {
      PAID: enriched.filter((l) => l.status === 'PAID').length,
      PARTIALLY_PAID: enriched.filter((l) => l.status === 'PARTIALLY_PAID').length,
      OUTSTANDING: enriched.filter((l) => l.status === 'OUTSTANDING').length,
      OVERDUE: enriched.filter((l) => l.status === 'OVERDUE').length,
    },
  };
}

module.exports = {
  listLoans,
  getLoan,
  createLoan,
  updateLoan,
  deleteLoan,
  addPayment,
  listPayments,
  deletePayment,
  loanDashboard,
  enrichLoan,
};
