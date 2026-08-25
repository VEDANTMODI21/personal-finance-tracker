const router = require('express').Router();
const controller = require('../controllers/loan.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { validateBody, validateQuery } = require('../middleware/validation.middleware');
const {
  createLoanSchema,
  updateLoanSchema,
  createPaymentSchema,
  listLoanQuerySchema,
} = require('../validators/loan.validator');

router.use(requireAuth);

router.get('/dashboard', controller.dashboard);
router.get('/', validateQuery(listLoanQuerySchema), controller.list);
router.post('/', validateBody(createLoanSchema), controller.create);
router.get('/:id', controller.getOne);
router.put('/:id', validateBody(updateLoanSchema), controller.update);
router.delete('/:id', controller.remove);

router.get('/:id/payments', controller.listPayments);
router.post('/:id/payments', validateBody(createPaymentSchema), controller.addPayment);
router.delete('/:id/payments/:paymentId', controller.deletePayment);

module.exports = router;
