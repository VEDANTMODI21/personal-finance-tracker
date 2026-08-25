const router = require('express').Router();
const controller = require('../controllers/budget.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { validateBody } = require('../middleware/validation.middleware');
const { upsertBudgetSchema } = require('../validators/budget.validator');

router.use(requireAuth);
router.get('/', controller.list);
router.post('/', validateBody(upsertBudgetSchema), controller.upsert);
router.delete('/:id', controller.remove);

module.exports = router;
