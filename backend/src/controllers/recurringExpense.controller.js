const catchAsync = require('../utils/catchAsync');
const { success } = require('../utils/apiResponse');
const service = require('../services/recurringExpense.service');

const list = catchAsync(async (req, res) => {
  const recurringExpenses = await service.listRecurringExpenses(req.user.id);
  success(res, { recurringExpenses });
});

const create = catchAsync(async (req, res) => {
  const recurringExpense = await service.createRecurringExpense(req.user.id, req.body);
  success(res, { recurringExpense }, 201);
});

const update = catchAsync(async (req, res) => {
  const recurringExpense = await service.updateRecurringExpense(req.user.id, req.params.id, req.body);
  success(res, { recurringExpense });
});

const remove = catchAsync(async (req, res) => {
  await service.deleteRecurringExpense(req.user.id, req.params.id);
  success(res, { message: 'Recurring expense deleted.' });
});

const generate = catchAsync(async (req, res) => {
  const created = await service.generateDueExpenses(req.user.id);
  success(res, { generated: created.length, expenses: created });
});

module.exports = { list, create, update, remove, generate };
