const catchAsync = require('../utils/catchAsync');
const { success } = require('../utils/apiResponse');
const service = require('../services/budget.service');

const list = catchAsync(async (req, res) => {
  const budgets = await service.listBudgets(req.user.id, req.query.month);
  success(res, { budgets });
});

const upsert = catchAsync(async (req, res) => {
  const budget = await service.upsertBudget(req.user.id, req.body);
  success(res, { budget }, 201);
});

const remove = catchAsync(async (req, res) => {
  await service.deleteBudget(req.user.id, req.params.id);
  success(res, { message: 'Budget deleted.' });
});

module.exports = { list, upsert, remove };
