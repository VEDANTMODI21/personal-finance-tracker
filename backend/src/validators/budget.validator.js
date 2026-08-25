const { z } = require('zod');

const upsertBudgetSchema = z.object({
  categoryId: z.string().uuid().optional().nullable(),
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format'),
  limit: z.coerce.number().positive('Budget limit must be greater than zero'),
});

module.exports = { upsertBudgetSchema };
