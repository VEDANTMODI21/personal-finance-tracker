const router = require('express').Router();
const controller = require('../controllers/expense.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { validateBody, validateQuery } = require('../middleware/validation.middleware');
const {
  createExpenseSchema,
  updateExpenseSchema,
  listExpenseQuerySchema,
} = require('../validators/expense.validator');

router.use(requireAuth);

router.get('/', validateQuery(listExpenseQuerySchema), controller.list);
router.post('/', validateBody(createExpenseSchema), controller.create);
router.get('/:id', controller.getOne);
router.put('/:id', validateBody(updateExpenseSchema), controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
