/**
 * Resolves a "month" filter (?month=2026-08) or an explicit ?startDate/?endDate
 * range into a concrete [start, end) Date pair used across dashboard, expense
 * filters, and report generation. Defaults to the current calendar month.
 */
function resolveDateRange({ month, startDate, endDate }) {
  if (startDate || endDate) {
    const start = startDate ? new Date(startDate) : new Date(0);
    const end = endDate ? new Date(endDate) : new Date();
    // Make the end date inclusive of the whole day.
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  let year;
  let mon; // 0-indexed
  if (month) {
    const [y, m] = month.split('-').map(Number);
    year = y;
    mon = m - 1;
  } else {
    const now = new Date();
    year = now.getFullYear();
    mon = now.getMonth();
  }

  const start = new Date(Date.UTC(year, mon, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(year, mon + 1, 0, 23, 59, 59, 999));
  return { start, end };
}

function monthLabel(date = new Date()) {
  return date.toLocaleString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}

function currentMonthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

module.exports = { resolveDateRange, monthLabel, currentMonthKey };
