const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');

async function listCategories(userId) {
  return prisma.category.findMany({
    where: { userId },
    orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
  });
}

async function createCategory(userId, data) {
  const existing = await prisma.category.findUnique({
    where: { userId_name: { userId, name: data.name } },
  });
  if (existing) {
    throw new AppError('A category with this name already exists.', 409);
  }
  return prisma.category.create({ data: { ...data, userId } });
}

async function updateCategory(userId, categoryId, data) {
  const category = await prisma.category.findFirst({ where: { id: categoryId, userId } });
  if (!category) throw new AppError('Category not found.', 404);

  if (data.name && data.name !== category.name) {
    const existing = await prisma.category.findUnique({
      where: { userId_name: { userId, name: data.name } },
    });
    if (existing) throw new AppError('A category with this name already exists.', 409);
  }

  return prisma.category.update({ where: { id: categoryId }, data });
}

async function deleteCategory(userId, categoryId) {
  const category = await prisma.category.findFirst({ where: { id: categoryId, userId } });
  if (!category) throw new AppError('Category not found.', 404);

  const expenseCount = await prisma.expense.count({ where: { categoryId } });
  if (expenseCount > 0) {
    throw new AppError(
      `Cannot delete a category used by ${expenseCount} expense(s). Reassign or delete those expenses first.`,
      409,
    );
  }

  await prisma.category.delete({ where: { id: categoryId } });
}

module.exports = { listCategories, createCategory, updateCategory, deleteCategory };
