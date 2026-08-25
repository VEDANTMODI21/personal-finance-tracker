const { toNumber, round2, sum } = require('../../src/utils/money');

describe('money utils', () => {
  test('toNumber converts Decimal-like strings and numbers', () => {
    expect(toNumber('123.45')).toBe(123.45);
    expect(toNumber(50)).toBe(50);
    expect(toNumber(null)).toBe(0);
    expect(toNumber(undefined)).toBe(0);
  });

  test('round2 rounds to two decimal places', () => {
    expect(round2(10.005)).toBeCloseTo(10.01, 2);
    expect(round2(10.004)).toBe(10);
  });

  test('sum avoids floating point drift across many small values', () => {
    const values = Array(10).fill(0.1);
    expect(sum(values)).toBe(1);
  });

  test('sum handles Decimal-like string inputs', () => {
    expect(sum(['10.10', '20.20', '5.70'])).toBe(36);
  });
});
