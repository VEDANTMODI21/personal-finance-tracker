const catchAsync = require('../utils/catchAsync');
const { success } = require('../utils/apiResponse');
const dashboardService = require('../services/dashboard.service');

const list = catchAsync(async (req, res) => {
  const transactions = await dashboardService.getTransactions(req.user.id, req.query);
  success(res, { transactions });
});

module.exports = { list };
