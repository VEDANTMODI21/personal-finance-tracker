const PAYMENT_METHODS = ['CASH', 'UPI', 'DEBIT_CARD', 'CREDIT_CARD', 'BANK_TRANSFER', 'OTHER'];

const INCOME_SOURCES = [
  'SALARY', 'FREELANCE', 'INTERNSHIP', 'BONUS', 'BUSINESS', 'INVESTMENT', 'GIFT', 'OTHER',
];

const LOAN_STATUSES = ['OUTSTANDING', 'PARTIALLY_PAID', 'PAID', 'OVERDUE'];

const RECURRENCE_FREQUENCIES = ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'];

const DEFAULT_CATEGORIES = [
  'Food', 'Transport', 'Shopping', 'Bills', 'Entertainment',
  'Education', 'Health', 'Travel', 'Subscriptions', 'Rent', 'Other',
];

module.exports = {
  PAYMENT_METHODS,
  INCOME_SOURCES,
  LOAN_STATUSES,
  RECURRENCE_FREQUENCIES,
  DEFAULT_CATEGORIES,
};
