const router = require('express').Router();
const controller = require('../controllers/user.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { validateBody } = require('../middleware/validation.middleware');
const { updateSettingsSchema } = require('../validators/user.validator');

router.use(requireAuth);
router.put('/settings', validateBody(updateSettingsSchema), controller.updateSettings);

module.exports = router;
