const { z } = require('zod');
const { PAYMENT_METHODS } = require('../constants');

const createExpenseSchema = z.object({
  amount: z.coerce.number().positive('Amount must be greater than zero'),
  categoryId: z.string().uuid('A valid category is required'),
  description: z.string().trim().min(1, 'Description is required').max(255),
  date: z.coerce.date({ errorMap: () => ({ message: 'A valid date is required' }) }),
  paymentMethod: z.enum(PAYMENT_METHODS, {
    errorMap: () => ({ message: `Payment method must be one of: ${PAYMENT_METHODS.join(', ')}` }),
  }),
  notes: z.string().trim().max(1000).optional().nullable(),
});

const updateExpenseSchema = createExpenseSchema.partial();

const listExpenseQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  search: z.string().trim().optional(),
  categoryId: z.string().uuid().optional(),
  paymentMethod: z.enum(PAYMENT_METHODS).optional(),
  minAmount: z.coerce.number().nonnegative().optional(),
  maxAmount: z.coerce.number().nonnegative().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  month: z
    .string()
    .regex(/^\d{4}-\d{2}$/)
    .optional(),
  sortBy: z.enum(['date', 'amount', 'description', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

module.exports = { createExpenseSchema, updateExpenseSchema, listExpenseQuerySchema };
