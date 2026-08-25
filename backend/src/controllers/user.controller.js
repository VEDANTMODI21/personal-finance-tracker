const catchAsync = require('../utils/catchAsync');
const { success } = require('../utils/apiResponse');
const service = require('../services/user.service');

const updateSettings = catchAsync(async (req, res) => {
  const user = await service.updateSettings(req.user.id, req.body);
  success(res, { user });
});

module.exports = { updateSettings };
