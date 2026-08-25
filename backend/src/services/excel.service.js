const ExcelJS = require('exceljs');
const { toNumber } = require('../utils/money');

const HEADER_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } };
const HEADER_FONT = { bold: true, color: { argb: 'FFFFFFFF' } };

function styleHeaderRow(row) {
  row.eachCell((cell) => {
    cell.fill = HEADER_FILL;
    cell.font = HEADER_FONT;
    cell.alignment = { vertical: 'middle', horizontal: 'left' };
  });
  row.height = 20;
}

function autoWidth(sheet) {
  sheet.columns.forEach((col) => {
    let max = 10;
    col.eachCell({ includeEmpty: true }, (cell) => {
      const len = cell.value ? String(cell.value).length : 0;
      if (len > max) max = len;
    });
    col.width = Math.min(max + 3, 45);
  });
}

/**
 * Builds the 6-sheet monthly export workbook described in spec section 21,
 * returning it as a Buffer ready to stream in the HTTP response.
 */
async function generateMonthlyReportExcel(report) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Personal Finance & Budget Tracker';
  workbook.created = new Date();

  buildSummarySheet(workbook, report);
  buildExpensesSheet(workbook, report);
  buildIncomeSheet(workbook, report);
  buildLoansSheet(workbook, report);
  buildLoanPaymentsSheet(workbook, report);
  buildCategorySummarySheet(workbook, report);

  return workbook.xlsx.writeBuffer();
}

function buildSummarySheet(workbook, report) {
  const sheet = workbook.addWorksheet('Summary');
  sheet.columns = [{ header: 'Metric', key: 'metric', width: 30 }, { header: 'Value', key: 'value', width: 25 }];
  styleHeaderRow(sheet.getRow(1));

  const s = report.summary;
  const rows = [
    ['Report Month', report.monthLabel],
    ['Total Income', s.income],
    ['Total Expenses', s.expenses],
    ['Net Balance', s.balance],
    ['Total Loans Given', s.loansGiven],
    ['Total Loan Repayments', s.loansRepaid],
    ['Outstanding Loans', s.outstanding],
  ];
  rows.forEach((r) => sheet.addRow(r));
  sheet.getColumn(2).numFmt = '#,##0.00';
  autoWidth(sheet);
}

function buildExpensesSheet(workbook, report) {
  const sheet = workbook.addWorksheet('Expenses');
  sheet.columns = [
    { header: 'Date', key: 'date', width: 14 },
    { header: 'Category', key: 'category', width: 20 },
    { header: 'Description', key: 'description', width: 35 },
    { header: 'Amount', key: 'amount', width: 15 },
    { header: 'Payment Method', key: 'paymentMethod', width: 18 },
    { header: 'Notes', key: 'notes', width: 30 },
  ];
  styleHeaderRow(sheet.getRow(1));

  report.rawExpenses.forEach((e) => {
    sheet.addRow({
      date: new Date(e.date).toLocaleDateString('en-IN'),
      category: e.category?.name || 'Other',
      description: e.description,
      amount: toNumber(e.amount),
      paymentMethod: e.paymentMethod.replace('_', ' '),
      notes: e.notes || '',
    });
  });
  sheet.getColumn('amount').numFmt = '#,##0.00';
  autoWidth(sheet);
}

function buildIncomeSheet(workbook, report) {
  const sheet = workbook.addWorksheet('Income');
  sheet.columns = [
    { header: 'Date', key: 'date', width: 14 },
    { header: 'Source', key: 'source', width: 18 },
    { header: 'Amount', key: 'amount', width: 15 },
    { header: 'Description', key: 'description', width: 30 },
    { header: 'Notes', key: 'notes', width: 30 },
  ];
  styleHeaderRow(sheet.getRow(1));

  report.rawIncomes.forEach((i) => {
    sheet.addRow({
      date: new Date(i.date).toLocaleDateString('en-IN'),
      source: i.source,
      amount: toNumber(i.amount),
      description: i.description || '',
      notes: i.notes || '',
    });
  });
  sheet.getColumn('amount').numFmt = '#,##0.00';
  autoWidth(sheet);
}

function buildLoansSheet(workbook, report) {
  const sheet = workbook.addWorksheet('Loans');
  sheet.columns = [
    { header: 'Person', key: 'person', width: 22 },
    { header: 'Amount Given', key: 'amount', width: 16 },
    { header: 'Date Given', key: 'dateGiven', width: 14 },
    { header: 'Due Date', key: 'dueDate', width: 14 },
    { header: 'Total Repaid', key: 'repaid', width: 16 },
    { header: 'Outstanding', key: 'outstanding', width: 16 },
    { header: 'Status', key: 'status', width: 16 },
  ];
  styleHeaderRow(sheet.getRow(1));

  report.rawLoans.forEach((l) => {
    sheet.addRow({
      person: l.personName,
      amount: toNumber(l.amount),
      dateGiven: new Date(l.dateGiven).toLocaleDateString('en-IN'),
      dueDate: l.dueDate ? new Date(l.dueDate).toLocaleDateString('en-IN') : '',
      repaid: l.totalRepaid,
      outstanding: l.remainingAmount,
      status: l.status.replace('_', ' '),
    });
  });
  ['amount', 'repaid', 'outstanding'].forEach((key) => {
    sheet.getColumn(key).numFmt = '#,##0.00';
  });
  autoWidth(sheet);
}

function buildLoanPaymentsSheet(workbook, report) {
  const sheet = workbook.addWorksheet('Loan Payments');
  sheet.columns = [
    { header: 'Person', key: 'person', width: 22 },
    { header: 'Payment Date', key: 'paymentDate', width: 15 },
    { header: 'Amount', key: 'amount', width: 15 },
    { header: 'Notes', key: 'notes', width: 30 },
  ];
  styleHeaderRow(sheet.getRow(1));

  report.rawLoans.forEach((l) => {
    (l.payments || []).forEach((p) => {
      sheet.addRow({
        person: l.personName,
        paymentDate: new Date(p.paymentDate).toLocaleDateString('en-IN'),
        amount: toNumber(p.amount),
        notes: p.notes || '',
      });
    });
  });
  sheet.getColumn('amount').numFmt = '#,##0.00';
  autoWidth(sheet);
}

function buildCategorySummarySheet(workbook, report) {
  const sheet = workbook.addWorksheet('Category Summary');
  sheet.columns = [
    { header: 'Category', key: 'category', width: 25 },
    { header: 'Total', key: 'total', width: 18 },
    { header: 'Percentage', key: 'percentage', width: 15 },
  ];
  styleHeaderRow(sheet.getRow(1));

  report.expenseBreakdown.forEach((c) => {
    sheet.addRow({ category: c.category, total: c.total, percentage: `${c.percentage}%` });
  });
  sheet.getColumn('total').numFmt = '#,##0.00';
  autoWidth(sheet);
}

module.exports = { generateMonthlyReportExcel };
