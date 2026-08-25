const router = require('express').Router();
const controller = require('../controllers/recurringExpense.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { validateBody } = require('../middleware/validation.middleware');
const {
  createRecurringExpenseSchema,
  updateRecurringExpenseSchema,
} = require('../validators/recurringExpense.validator');

router.use(requireAuth);
router.get('/', controller.list);
router.post('/', validateBody(createRecurringExpenseSchema), controller.create);
router.put('/:id', validateBody(updateRecurringExpenseSchema), controller.update);
router.delete('/:id', controller.remove);
router.post('/generate-due', controller.generate);

module.exports = router;
