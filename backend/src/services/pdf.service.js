const PDFDocument = require('pdfkit');

const COLORS = {
  primary: '#1e3a5f',
  accent: '#2563eb',
  text: '#1f2937',
  muted: '#6b7280',
  border: '#e5e7eb',
  income: '#16a34a',
  expense: '#dc2626',
  headerBg: '#f3f4f6',
};

function formatCurrency(n) {
  return `Rs. ${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

/**
 * Renders the monthly report data model (see report.service.js) into a
 * professional, printable PDF using PDFKit, and returns it as a Buffer.
 */
function generateMonthlyReportPDF(report, user) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 40, bufferPages: true });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    drawHeader(doc, report, user);
    drawSummary(doc, report);
    drawExpenseBreakdown(doc, report);
    drawPaymentMethodBreakdown(doc, report);
    drawLoanSummary(doc, report);
    drawTransactions(doc, report);
    drawFooter(doc);

    doc.end();
  });
}

function drawHeader(doc, report, user) {
  doc
    .rect(0, 0, doc.page.width, 90)
    .fill(COLORS.primary);

  doc
    .fillColor('#ffffff')
    .fontSize(20)
    .font('Helvetica-Bold')
    .text('Personal Finance Report', 40, 28);

  doc
    .fontSize(12)
    .font('Helvetica')
    .text(`${report.monthLabel}`, 40, 54);

  doc
    .fontSize(9)
    .text(`Generated for ${user.name} (${user.email})  |  ${new Date().toLocaleString('en-IN')}`, 40, 70);

  doc.moveDown(3);
  doc.y = 110;
  doc.fillColor(COLORS.text);
}

function sectionTitle(doc, title) {
  doc.moveDown(0.5);
  doc
    .fontSize(13)
    .font('Helvetica-Bold')
    .fillColor(COLORS.accent)
    .text(title);
  doc
    .moveTo(doc.x, doc.y + 2)
    .lineTo(doc.page.width - 40, doc.y + 2)
    .strokeColor(COLORS.border)
    .stroke();
  doc.moveDown(0.6);
  doc.fillColor(COLORS.text).font('Helvetica');
}

function drawSummary(doc, report) {
  sectionTitle(doc, 'Summary');
  const s = report.summary;
  const rows = [
    ['Total Income', formatCurrency(s.income), COLORS.income],
    ['Total Expenses', formatCurrency(s.expenses), COLORS.expense],
    ['Net Balance', formatCurrency(s.balance), s.balance >= 0 ? COLORS.income : COLORS.expense],
    ['Loans Given', formatCurrency(s.loansGiven), COLORS.text],
    ['Loans Repaid', formatCurrency(s.loansRepaid), COLORS.text],
    ['Outstanding Loans', formatCurrency(s.outstanding), COLORS.text],
  ];

  const colWidth = (doc.page.width - 80) / 2;
  let startY = doc.y;
  rows.forEach((row, idx) => {
    const col = idx % 2;
    const rowIdx = Math.floor(idx / 2);
    const x = 40 + col * colWidth;
    const y = startY + rowIdx * 22;
    doc.font('Helvetica').fontSize(10).fillColor(COLORS.muted).text(row[0], x, y, { continued: false });
    doc.font('Helvetica-Bold').fontSize(11).fillColor(row[2]).text(row[1], x, y + 12);
  });
  doc.y = startY + Math.ceil(rows.length / 2) * 22 + 20;
  doc.fillColor(COLORS.text);
}

function drawTable(doc, { headers, rows, columnWidths, emptyText }) {
  const startX = 40;
  let y = doc.y;
  const rowHeight = 18;

  doc.font('Helvetica-Bold').fontSize(9).fillColor('#ffffff');
  doc.rect(startX, y, doc.page.width - 80, rowHeight).fill(COLORS.primary);
  doc.fillColor('#ffffff');
  let x = startX;
  headers.forEach((h, i) => {
    doc.text(h, x + 4, y + 5, { width: columnWidths[i] - 8 });
    x += columnWidths[i];
  });
  y += rowHeight;

  doc.font('Helvetica').fontSize(9).fillColor(COLORS.text);

  if (rows.length === 0) {
    doc.fillColor(COLORS.muted).text(emptyText || 'No records for this period.', startX + 4, y + 5);
    doc.y = y + rowHeight + 4;
    return;
  }

  rows.forEach((row, idx) => {
    if (y > doc.page.height - 80) {
      doc.addPage();
      y = 40;
    }
    if (idx % 2 === 0) {
      doc.rect(startX, y, doc.page.width - 80, rowHeight).fill(COLORS.headerBg);
    }
    doc.fillColor(COLORS.text);
    x = startX;
    row.forEach((cell, i) => {
      doc.text(String(cell), x + 4, y + 5, { width: columnWidths[i] - 8 });
      x += columnWidths[i];
    });
    y += rowHeight;
  });

  doc.y = y + 10;
}

function drawExpenseBreakdown(doc, report) {
  sectionTitle(doc, 'Expense Breakdown by Category');
  drawTable(doc, {
    headers: ['Category', 'Total', '% of Expenses'],
    columnWidths: [260, 150, 105],
    rows: report.expenseBreakdown.map((c) => [c.category, formatCurrency(c.total), `${c.percentage}%`]),
    emptyText: 'No expenses recorded for this period.',
  });
}

function drawPaymentMethodBreakdown(doc, report) {
  sectionTitle(doc, 'Payment Method Breakdown');
  drawTable(doc, {
    headers: ['Payment Method', 'Total'],
    columnWidths: [260, 255],
    rows: report.paymentMethodBreakdown.map((m) => [m.method.replace('_', ' '), formatCurrency(m.total)]),
    emptyText: 'No expenses recorded for this period.',
  });
}

function drawLoanSummary(doc, report) {
  sectionTitle(doc, 'Loan Summary');
  drawTable(doc, {
    headers: ['Person', 'Amount Given', 'Repaid', 'Outstanding', 'Status'],
    columnWidths: [130, 100, 100, 100, 85],
    rows: report.loanSummaryRows.map((l) => [
      l.personName,
      formatCurrency(l.amountGiven),
      formatCurrency(l.repaid),
      formatCurrency(l.outstanding),
      l.status.replace('_', ' '),
    ]),
    emptyText: 'No loans on record.',
  });
}

function drawTransactions(doc, report) {
  if (doc.y > doc.page.height - 200) doc.addPage();
  sectionTitle(doc, 'Transactions');
  drawTable(doc, {
    headers: ['Date', 'Type', 'Description', 'Amount'],
    columnWidths: [80, 70, 245, 120],
    rows: report.transactions
      .slice(0, 60)
      .map((t) => [formatDate(t.date), t.type, t.description, formatCurrency(t.amount)]),
    emptyText: 'No transactions recorded for this period.',
  });
}

function drawFooter(doc) {
  const range = doc.bufferedPageRange();
  for (let i = 0; i < range.count; i += 1) {
    doc.switchToPage(i);
    doc
      .fontSize(8)
      .fillColor(COLORS.muted)
      .text(
        `Personal Finance & Budget Tracker  •  Page ${i + 1} of ${range.count}`,
        40,
        doc.page.height - 30,
        { align: 'center', width: doc.page.width - 80 },
      );
  }
}

module.exports = { generateMonthlyReportPDF };
