function success(res, data = {}, statusCode = 200, meta = undefined) {
  const body = { success: true, data };
  if (meta) body.meta = meta;
  return res.status(statusCode).json(body);
}

function fail(res, message, statusCode = 400) {
  return res.status(statusCode).json({ success: false, message });
}

module.exports = { success, fail };
