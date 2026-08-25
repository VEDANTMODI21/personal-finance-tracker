const { z } = require('zod');
const { PAYMENT_METHODS, RECURRENCE_FREQUENCIES } = require('../constants');

const createRecurringExpenseSchema = z.object({
  categoryId: z.string().uuid('A valid category is required'),
  amount: z.coerce.number().positive('Amount must be greater than zero'),
  description: z.string().trim().min(1).max(255),
  paymentMethod: z.enum(PAYMENT_METHODS),
  frequency: z.enum(RECURRENCE_FREQUENCIES),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional().nullable(),
});

const updateRecurringExpenseSchema = createRecurringExpenseSchema.partial().extend({
  isActive: z.boolean().optional(),
});

module.exports = { createRecurringExpenseSchema, updateRecurringExpenseSchema };
