export const PAYMENT_METHODS = ['CASH', 'UPI', 'DEBIT_CARD', 'CREDIT_CARD', 'BANK_TRANSFER', 'OTHER'];

export const INCOME_SOURCES = [
  'SALARY', 'FREELANCE', 'INTERNSHIP', 'BONUS', 'BUSINESS', 'INVESTMENT', 'GIFT', 'OTHER',
];

export const LOAN_STATUSES = ['OUTSTANDING', 'PARTIALLY_PAID', 'PAID', 'OVERDUE'];

export const RECURRENCE_FREQUENCIES = ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'];

export const LABELS = {
  CASH: 'Cash',
  UPI: 'UPI',
  DEBIT_CARD: 'Debit Card',
  CREDIT_CARD: 'Credit Card',
  BANK_TRANSFER: 'Bank Transfer',
  OTHER: 'Other',
  SALARY: 'Salary',
  FREELANCE: 'Freelance',
  INTERNSHIP: 'Internship',
  BONUS: 'Bonus',
  BUSINESS: 'Business',
  INVESTMENT: 'Investment',
  GIFT: 'Gift',
  OUTSTANDING: 'Outstanding',
  PARTIALLY_PAID: 'Partially Paid',
  PAID: 'Paid',
  OVERDUE: 'Overdue',
  DAILY: 'Daily',
  WEEKLY: 'Weekly',
  MONTHLY: 'Monthly',
  YEARLY: 'Yearly',
};

export const CATEGORY_COLORS = [
  '#7c3aed', '#14b8a6', '#d946ef', '#f59e0b', '#3b82f6',
  '#10b981', '#ec4899', '#8b5cf6', '#0ea5e9', '#f43f5e', '#84cc16',
];

export const STATUS_STYLES = {
  OUTSTANDING: 'bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400',
  PARTIALLY_PAID: 'bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400',
  PAID: 'bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-400',
  OVERDUE: 'bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400',
};
