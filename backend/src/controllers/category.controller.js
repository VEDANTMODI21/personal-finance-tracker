const catchAsync = require('../utils/catchAsync');
const { success } = require('../utils/apiResponse');
const service = require('../services/category.service');
const { PAYMENT_METHODS } = require('../constants');

const list = catchAsync(async (req, res) => {
  const categories = await service.listCategories(req.user.id);
  success(res, { categories, paymentMethods: PAYMENT_METHODS });
});

const create = catchAsync(async (req, res) => {
  const category = await service.createCategory(req.user.id, req.body);
  success(res, { category }, 201);
});

const update = catchAsync(async (req, res) => {
  const category = await service.updateCategory(req.user.id, req.params.id, req.body);
  success(res, { category });
});

const remove = catchAsync(async (req, res) => {
  await service.deleteCategory(req.user.id, req.params.id);
  success(res, { message: 'Category deleted.' });
});

module.exports = { list, create, update, remove };
