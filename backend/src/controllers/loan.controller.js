const catchAsync = require('../utils/catchAsync');
const { success } = require('../utils/apiResponse');
const service = require('../services/loan.service');

const list = catchAsync(async (req, res) => {
  const { loans, meta } = await service.listLoans(req.user.id, req.query);
  success(res, { loans }, 200, meta);
});

const getOne = catchAsync(async (req, res) => {
  const loan = await service.getLoan(req.user.id, req.params.id);
  success(res, { loan });
});

const create = catchAsync(async (req, res) => {
  const loan = await service.createLoan(req.user.id, req.body);
  success(res, { loan }, 201);
});

const update = catchAsync(async (req, res) => {
  const loan = await service.updateLoan(req.user.id, req.params.id, req.body);
  success(res, { loan });
});

const remove = catchAsync(async (req, res) => {
  await service.deleteLoan(req.user.id, req.params.id);
  success(res, { message: 'Loan deleted.' });
});

const listPayments = catchAsync(async (req, res) => {
  const payments = await service.listPayments(req.user.id, req.params.id);
  success(res, { payments });
});

const addPayment = catchAsync(async (req, res) => {
  const loan = await service.addPayment(req.user.id, req.params.id, req.body);
  success(res, { loan }, 201);
});

const deletePayment = catchAsync(async (req, res) => {
  const loan = await service.deletePayment(req.user.id, req.params.id, req.params.paymentId);
  success(res, { loan });
});

const dashboard = catchAsync(async (req, res) => {
  const data = await service.loanDashboard(req.user.id);
  success(res, data);
});

module.exports = { list, getOne, create, update, remove, listPayments, addPayment, deletePayment, dashboard };
