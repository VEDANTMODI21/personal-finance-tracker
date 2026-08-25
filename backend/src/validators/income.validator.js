const { z } = require('zod');
const { INCOME_SOURCES } = require('../constants');

const createIncomeSchema = z.object({
  amount: z.coerce.number().positive('Amount must be greater than zero'),
  source: z.enum(INCOME_SOURCES, {
    errorMap: () => ({ message: `Source must be one of: ${INCOME_SOURCES.join(', ')}` }),
  }),
  description: z.string().trim().max(255).optional().nullable(),
  date: z.coerce.date({ errorMap: () => ({ message: 'A valid date is required' }) }),
  notes: z.string().trim().max(1000).optional().nullable(),
});

const updateIncomeSchema = createIncomeSchema.partial();

const listIncomeQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  search: z.string().trim().optional(),
  source: z.enum(INCOME_SOURCES).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  month: z.string().regex(/^\d{4}-\d{2}$/).optional(),
  sortBy: z.enum(['date', 'amount', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

module.exports = { createIncomeSchema, updateIncomeSchema, listIncomeQuerySchema };
