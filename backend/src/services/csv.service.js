const { toNumber } = require('../utils/money');

function escapeCsvValue(value) {
  const str = String(value ?? '');
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCsv(rows, columns) {
  const header = columns.map((c) => c.label).join(',');
  const lines = rows.map((row) => columns.map((c) => escapeCsvValue(c.value(row))).join(','));
  return [header, ...lines].join('\n');
}

/** CSV export of the combined transaction ledger (advanced feature). */
function transactionsToCsv(transactions) {
  return toCsv(transactions, [
    { label: 'Date', value: (t) => new Date(t.date).toISOString().slice(0, 10) },
    { label: 'Type', value: (t) => t.type },
    { label: 'Description', value: (t) => t.description },
    { label: 'Category', value: (t) => t.category || '' },
    { label: 'Amount', value: (t) => toNumber(t.amount) },
  ]);
}

module.exports = { toCsv, transactionsToCsv };
