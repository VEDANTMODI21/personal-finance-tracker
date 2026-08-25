const router = require('express').Router();
const controller = require('../controllers/category.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { validateBody } = require('../middleware/validation.middleware');
const { createCategorySchema, updateCategorySchema } = require('../validators/category.validator');

router.use(requireAuth);

router.get('/', controller.list);
router.post('/', validateBody(createCategorySchema), controller.create);
router.put('/:id', validateBody(updateCategorySchema), controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
