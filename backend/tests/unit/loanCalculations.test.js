const { computeLoanSummary, validateRepaymentAmount } = require('../../src/utils/loanCalculations');

describe('computeLoanSummary', () => {
  const baseLoan = { amount: 10000, dueDate: null };

  test('OUTSTANDING when nothing has been repaid', () => {
    const result = computeLoanSummary(baseLoan, []);
    expect(result).toEqual({
      originalAmount: 10000,
      totalRepaid: 0,
      remainingAmount: 10000,
      status: 'OUTSTANDING',
    });
  });

  test('PARTIALLY_PAID when some but not all has been repaid', () => {
    const payments = [{ amount: 3000 }, { amount: 2000 }];
    const result = computeLoanSummary(baseLoan, payments);
    expect(result.totalRepaid).toBe(5000);
    expect(result.remainingAmount).toBe(5000);
    expect(result.status).toBe('PARTIALLY_PAID');
  });

  test('PAID when fully repaid', () => {
    const payments = [{ amount: 6000 }, { amount: 4000 }];
    const result = computeLoanSummary(baseLoan, payments);
    expect(result.remainingAmount).toBe(0);
    expect(result.status).toBe('PAID');
  });

  test('PAID even if repayments exceed original amount is clamped to zero remaining', () => {
    const payments = [{ amount: 10000 }];
    const result = computeLoanSummary(baseLoan, payments);
    expect(result.remainingAmount).toBe(0);
    expect(result.status).toBe('PAID');
  });

  test('OVERDUE when due date has passed and balance remains, overriding OUTSTANDING', () => {
    const now = new Date('2026-08-25T00:00:00Z');
    const loan = { amount: 10000, dueDate: '2026-08-01T00:00:00Z' };
    const result = computeLoanSummary(loan, [], now);
    expect(result.status).toBe('OVERDUE');
  });

  test('OVERDUE when due date has passed even with partial repayment', () => {
    const now = new Date('2026-08-25T00:00:00Z');
    const loan = { amount: 10000, dueDate: '2026-08-01T00:00:00Z' };
    const result = computeLoanSummary(loan, [{ amount: 3000 }], now);
    expect(result.status).toBe('OVERDUE');
  });

  test('PAID takes priority over OVERDUE when fully repaid past due date', () => {
    const now = new Date('2026-08-25T00:00:00Z');
    const loan = { amount: 10000, dueDate: '2026-08-01T00:00:00Z' };
    const result = computeLoanSummary(loan, [{ amount: 10000 }], now);
    expect(result.status).toBe('PAID');
  });

  test('not overdue when due date is in the future', () => {
    const now = new Date('2026-08-25T00:00:00Z');
    const loan = { amount: 10000, dueDate: '2026-09-25T00:00:00Z' };
    const result = computeLoanSummary(loan, [], now);
    expect(result.status).toBe('OUTSTANDING');
  });

  test('handles floating point repayments without drift', () => {
    const loan = { amount: 100.1, dueDate: null };
    const payments = [{ amount: 33.4 }, { amount: 33.4 }, { amount: 33.3 }];
    const result = computeLoanSummary(loan, payments);
    expect(result.remainingAmount).toBe(0);
    expect(result.status).toBe('PAID');
  });
});

describe('validateRepaymentAmount', () => {
  test('rejects zero or negative amounts', () => {
    expect(validateRepaymentAmount(0, 5000)).toMatch(/greater than zero/);
    expect(validateRepaymentAmount(-50, 5000)).toMatch(/greater than zero/);
  });

  test('rejects amounts greater than the outstanding balance', () => {
    expect(validateRepaymentAmount(5001, 5000)).toMatch(/cannot exceed/);
  });

  test('accepts an amount equal to the outstanding balance', () => {
    expect(validateRepaymentAmount(5000, 5000)).toBeNull();
  });

  test('accepts a valid partial repayment', () => {
    expect(validateRepaymentAmount(1000, 5000)).toBeNull();
  });
});
