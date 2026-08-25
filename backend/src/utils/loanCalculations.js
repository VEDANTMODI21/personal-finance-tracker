const { toNumber, sum, round2 } = require('./money');

/**
 * Pure, DB-free loan math. Kept separate from the Prisma service layer so it
 * can be unit tested in isolation (see tests/unit/loanCalculations.test.js).
 *
 * Status rules (from spec section 14):
 *   remaining === 0                       -> PAID
 *   remaining > 0 && repayments exist     -> PARTIALLY_PAID
 *   remaining === original amount          -> OUTSTANDING
 *   dueDate passed && remaining > 0        -> OVERDUE (overrides the above,
 *                                             except PAID always wins)
 */
function computeLoanSummary(loan, payments, now = new Date()) {
  const originalAmount = round2(toNumber(loan.amount));
  const totalRepaid = sum(payments.map((p) => p.amount));
  const remainingAmount = round2(Math.max(0, originalAmount - totalRepaid));

  let status;
  if (remainingAmount <= 0) {
    status = 'PAID';
  } else if (loan.dueDate && new Date(loan.dueDate).getTime() < now.getTime()) {
    status = 'OVERDUE';
  } else if (totalRepaid > 0) {
    status = 'PARTIALLY_PAID';
  } else {
    status = 'OUTSTANDING';
  }

  return { originalAmount, totalRepaid, remainingAmount, status };
}

/**
 * Throws-free validation: returns an error message string, or null if the
 * proposed repayment is valid against the current outstanding balance.
 */
function validateRepaymentAmount(amount, remainingAmount) {
  const value = toNumber(amount);
  if (!(value > 0)) {
    return 'Repayment amount must be greater than zero.';
  }
  if (round2(value) > round2(remainingAmount)) {
    return `Repayment amount (${value}) cannot exceed the outstanding balance (${remainingAmount}).`;
  }
  return null;
}

module.exports = { computeLoanSummary, validateRepaymentAmount };
