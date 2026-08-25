const { z } = require('zod');

const updateSettingsSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  darkMode: z.boolean().optional(),
  monthlyBudget: z.coerce.number().nonnegative().nullable().optional(),
  budgetAlertPct: z.coerce.number().int().min(1).max(100).optional(),
});

module.exports = { updateSettingsSchema };
