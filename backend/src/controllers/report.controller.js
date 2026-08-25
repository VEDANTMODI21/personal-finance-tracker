const catchAsync = require('../utils/catchAsync');
const { success } = require('../utils/apiResponse');
const AppError = require('../utils/AppError');
const reportService = require('../services/report.service');
const { generateMonthlyReportPDF } = require('../services/pdf.service');
const { generateMonthlyReportExcel } = require('../services/excel.service');
const { transactionsToCsv } = require('../services/csv.service');
const dashboardService = require('../services/dashboard.service');

const monthly = catchAsync(async (req, res) => {
  const report = await reportService.buildMonthlyReport(req.user.id, req.query.month);
  // Strip internal Prisma rows the PDF/Excel generators need but the JSON API should not leak.
  const { rawExpenses: _rawExpenses, rawIncomes: _rawIncomes, rawLoans: _rawLoans, rawPayments: _rawPayments, ...safeReport } = report;
  success(res, { report: safeReport });
});

const monthlyPdf = catchAsync(async (req, res) => {
  const { month } = req.query;
  if (!month) throw new AppError('A month query parameter (YYYY-MM) is required.', 400);
  const report = await reportService.buildMonthlyReport(req.user.id, month);
  const pdfBuffer = await generateMonthlyReportPDF(report, req.user);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="finance-report-${month}.pdf"`);
  res.send(pdfBuffer);
});

const monthlyExcel = catchAsync(async (req, res) => {
  const { month } = req.query;
  if (!month) throw new AppError('A month query parameter (YYYY-MM) is required.', 400);
  const report = await reportService.buildMonthlyReport(req.user.id, month);
  const buffer = await generateMonthlyReportExcel(report);

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="finance-report-${month}.xlsx"`);
  res.send(buffer);
});

const monthlyCsv = catchAsync(async (req, res) => {
  const { month } = req.query;
  if (!month) throw new AppError('A month query parameter (YYYY-MM) is required.', 400);
  const transactions = await dashboardService.getTransactions(req.user.id, { month });
  const csv = transactionsToCsv(transactions);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="transactions-${month}.csv"`);
  res.send(csv);
});

module.exports = { monthly, monthlyPdf, monthlyExcel, monthlyCsv };
