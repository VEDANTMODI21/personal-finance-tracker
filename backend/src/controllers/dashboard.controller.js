const catchAsync = require('../utils/catchAsync');
const { success } = require('../utils/apiResponse');
const dashboardService = require('../services/dashboard.service');

const getDashboard = catchAsync(async (req, res) => {
  const data = await dashboardService.getDashboard(req.user.id, req.query);
  success(res, data);
});

module.exports = { getDashboard };
