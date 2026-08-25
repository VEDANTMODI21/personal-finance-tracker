const catchAsync = require('../utils/catchAsync');
const { success } = require('../utils/apiResponse');
const service = require('../services/expense.service');

const list = catchAsync(async (req, res) => {
  const { expenses, meta } = await service.listExpenses(req.user.id, req.query);
  success(res, { expenses }, 200, meta);
});

const getOne = catchAsync(async (req, res) => {
  const expense = await service.getExpense(req.user.id, req.params.id);
  success(res, { expense });
});

const create = catchAsync(async (req, res) => {
  const expense = await service.createExpense(req.user.id, req.body);
  success(res, { expense }, 201);
});

const update = catchAsync(async (req, res) => {
  const expense = await service.updateExpense(req.user.id, req.params.id, req.body);
  success(res, { expense });
});

const remove = catchAsync(async (req, res) => {
  await service.deleteExpense(req.user.id, req.params.id);
  success(res, { message: 'Expense deleted.' });
});

module.exports = { list, getOne, create, update, remove };
