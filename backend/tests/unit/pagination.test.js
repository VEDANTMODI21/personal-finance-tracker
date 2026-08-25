const { parsePagination, buildMeta } = require('../../src/utils/pagination');

describe('parsePagination', () => {
  test('applies sane defaults when nothing is passed', () => {
    expect(parsePagination({})).toEqual({ page: 1, limit: 20, skip: 0, take: 20 });
  });

  test('computes skip correctly for later pages', () => {
    expect(parsePagination({ page: '3', limit: '10' })).toEqual({ page: 3, limit: 10, skip: 20, take: 10 });
  });

  test('clamps limit to the configured maximum', () => {
    expect(parsePagination({ limit: '500' }).limit).toBe(100);
  });

  test('falls back to defaults for invalid input', () => {
    expect(parsePagination({ page: '-5', limit: 'abc' })).toEqual({ page: 1, limit: 20, skip: 0, take: 20 });
  });
});

describe('buildMeta', () => {
  test('computes total pages, rounding up', () => {
    expect(buildMeta({ page: 1, limit: 10, total: 25 })).toEqual({
      page: 1,
      limit: 10,
      total: 25,
      totalPages: 3,
    });
  });

  test('always reports at least 1 total page', () => {
    expect(buildMeta({ page: 1, limit: 10, total: 0 }).totalPages).toBe(1);
  });
});
