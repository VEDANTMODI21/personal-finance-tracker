const router = require('express').Router();
const controller = require('../controllers/income.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { validateBody, validateQuery } = require('../middleware/validation.middleware');
const {
  createIncomeSchema,
  updateIncomeSchema,
  listIncomeQuerySchema,
} = require('../validators/income.validator');

router.use(requireAuth);

router.get('/', validateQuery(listIncomeQuerySchema), controller.list);
router.post('/', validateBody(createIncomeSchema), controller.create);
router.get('/:id', controller.getOne);
router.put('/:id', validateBody(updateIncomeSchema), controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
