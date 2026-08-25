const { z } = require('zod');

const createCategorySchema = z.object({
  name: z.string().trim().min(1, 'Category name is required').max(50),
  icon: z.string().trim().max(50).optional().nullable(),
  color: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Color must be a hex code like #22c55e')
    .optional()
    .nullable(),
});

const updateCategorySchema = createCategorySchema.partial();

module.exports = { createCategorySchema, updateCategorySchema };
