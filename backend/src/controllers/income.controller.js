const catchAsync = require('../utils/catchAsync');
const { success } = require('../utils/apiResponse');
const service = require('../services/income.service');

const list = catchAsync(async (req, res) => {
  const { incomes, meta } = await service.listIncome(req.user.id, req.query);
  success(res, { incomes }, 200, meta);
});

const getOne = catchAsync(async (req, res) => {
  const income = await service.getIncome(req.user.id, req.params.id);
  success(res, { income });
});

const create = catchAsync(async (req, res) => {
  const income = await service.createIncome(req.user.id, req.body);
  success(res, { income }, 201);
});

const update = catchAsync(async (req, res) => {
  const income = await service.updateIncome(req.user.id, req.params.id, req.body);
  success(res, { income });
});

const remove = catchAsync(async (req, res) => {
  await service.deleteIncome(req.user.id, req.params.id);
  success(res, { message: 'Income record deleted.' });
});

module.exports = { list, getOne, create, update, remove };
