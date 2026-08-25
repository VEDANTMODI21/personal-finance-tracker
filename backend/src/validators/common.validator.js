const { z } = require('zod');

const dateRangeQuerySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  type: z.enum(['EXPENSE', 'INCOME', 'LOAN_GIVEN', 'LOAN_REPAYMENT']).optional(),
  search: z.string().trim().optional(),
});

module.exports = { dateRangeQuerySchema };
