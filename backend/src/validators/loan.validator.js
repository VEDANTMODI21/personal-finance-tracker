const { z } = require('zod');
const { LOAN_STATUSES } = require('../constants');

const createLoanSchema = z.object({
  personName: z.string().trim().min(1, 'Person name is required').max(100),
  amount: z.coerce.number().positive('Amount must be greater than zero'),
  dateGiven: z.coerce.date({ errorMap: () => ({ message: 'A valid date given is required' }) }),
  dueDate: z.coerce.date().optional().nullable(),
  notes: z.string().trim().max(1000).optional().nullable(),
});

const updateLoanSchema = createLoanSchema.partial();

const createPaymentSchema = z.object({
  amount: z.coerce.number().positive('Repayment amount must be greater than zero'),
  paymentDate: z.coerce.date({ errorMap: () => ({ message: 'A valid payment date is required' }) }),
  notes: z.string().trim().max(1000).optional().nullable(),
});

const listLoanQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  search: z.string().trim().optional(),
  status: z.enum(LOAN_STATUSES).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  dueBefore: z.coerce.date().optional(),
  dueAfter: z.coerce.date().optional(),
  sortBy: z.enum(['dateGiven', 'dueDate', 'amount', 'personName']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

module.exports = { createLoanSchema, updateLoanSchema, createPaymentSchema, listLoanQuerySchema };
