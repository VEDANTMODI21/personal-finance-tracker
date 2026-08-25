const router = require('express').Router();
const controller = require('../controllers/report.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.use(requireAuth);

router.get('/monthly', controller.monthly);
router.get('/monthly/pdf', controller.monthlyPdf);
router.get('/monthly/excel', controller.monthlyExcel);
router.get('/monthly/csv', controller.monthlyCsv);

module.exports = router;
