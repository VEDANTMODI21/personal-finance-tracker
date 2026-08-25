const { resolveDateRange, currentMonthKey } = require('../../src/utils/dateRange');

describe('resolveDateRange', () => {
  test('resolves a month string into a full calendar month range', () => {
    const { start, end } = resolveDateRange({ month: '2026-08' });
    expect(start.toISOString()).toBe('2026-08-01T00:00:00.000Z');
    expect(end.toISOString()).toBe('2026-08-31T23:59:59.999Z');
  });

  test('handles February month boundaries correctly', () => {
    const { start, end } = resolveDateRange({ month: '2026-02' });
    expect(start.getUTCDate()).toBe(1);
    expect(end.getUTCDate()).toBe(28); // 2026 is not a leap year
  });

  test('resolves an explicit start/end date range, inclusive of the end day', () => {
    const { start, end } = resolveDateRange({ startDate: '2026-08-01', endDate: '2026-08-10' });
    expect(end.getHours()).toBe(23);
    expect(start <= end).toBe(true);
  });

  test('defaults to the current month when nothing is provided', () => {
    const now = new Date();
    const { start } = resolveDateRange({});
    expect(start.getUTCFullYear()).toBe(now.getFullYear());
  });
});

describe('currentMonthKey', () => {
  test('formats as YYYY-MM with zero-padded month', () => {
    expect(currentMonthKey(new Date(2026, 0, 15))).toBe('2026-01');
    expect(currentMonthKey(new Date(2026, 10, 3))).toBe('2026-11');
  });
});
