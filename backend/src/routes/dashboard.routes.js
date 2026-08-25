const router = require('express').Router();
const controller = require('../controllers/dashboard.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { validateQuery } = require('../middleware/validation.middleware');
const { dateRangeQuerySchema } = require('../validators/common.validator');

router.get('/', requireAuth, validateQuery(dateRangeQuerySchema), controller.getDashboard);

module.exports = router;
