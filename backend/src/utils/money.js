/**
 * Small helpers for working with monetary values that come back from Prisma
 * as Decimal/string instances. We normalize to JS numbers rounded to 2dp for
 * arithmetic and API responses, avoiding floating point surprises by working
 * in integer paise/cents internally.
 */

function toNumber(value) {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  return parseFloat(value.toString());
}

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function sum(values) {
  const totalPaise = values.reduce((acc, v) => acc + Math.round(toNumber(v) * 100), 0);
  return round2(totalPaise / 100);
}

module.exports = { toNumber, round2, sum };
