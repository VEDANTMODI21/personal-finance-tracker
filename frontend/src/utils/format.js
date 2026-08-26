export function formatCurrency(amount) {
  const value = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

// Compact axis-label formatter — the charts used to divide every value by
// 1000 unconditionally, so anything under ₹1,000 (a very normal expense
// total) rounded down to "0k" on every single tick. This scales the unit to
// the value instead: plain rupees under 1k, "k" into the thousands, "L"
// (lakh) past 100k — matching the en-IN currency formatting used everywhere
// else in the app.
export function formatAxisValue(amount) {
  const value = Number(amount) || 0;
  const abs = Math.abs(value);
  const trim = (n) => (Math.round(n * 10) / 10).toString();
  if (abs >= 100000) return `₹${trim(value / 100000)}L`;
  if (abs >= 1000) return `₹${trim(value / 1000)}k`;
  return `₹${Math.round(value)}`;
}

export function formatCurrencyPrecise(amount) {
  const value = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(value);
}

export function formatDate(date, options = { day: '2-digit', month: 'short', year: 'numeric' }) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-IN', options);
}

export function formatDateInput(date) {
  const d = date ? new Date(date) : new Date();
  return d.toISOString().slice(0, 10);
}

export function monthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function shiftMonth(key, delta) {
  const [y, m] = key.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return monthKey(d);
}

export function monthLabel(key) {
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}
