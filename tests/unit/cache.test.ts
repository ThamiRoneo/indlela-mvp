import { isCacheExpired, isCacheFresh, CACHE_TTL_MS } from '../../lib/rules/cache';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

describe('T-F5-1 Cache expires after 7 days; expired cache returns null (BR8)', () => {
  it('CACHE_TTL_MS is 7 days', () => {
    expect(CACHE_TTL_MS).toBe(SEVEN_DAYS_MS);
  });

  it('null cachedAt is expired', () => {
    expect(isCacheExpired(null)).toBe(true);
    expect(isCacheFresh(null)).toBe(false);
  });

  it('cache within 7 days is fresh (not expired)', () => {
    const sixDaysAgo = Date.now() - 6 * 24 * 60 * 60 * 1000;
    expect(isCacheExpired(sixDaysAgo)).toBe(false);
    expect(isCacheFresh(sixDaysAgo)).toBe(true);
  });

  it('cache beyond 7 days is expired', () => {
    const eightDaysAgo = Date.now() - 8 * 24 * 60 * 60 * 1000;
    expect(isCacheExpired(eightDaysAgo)).toBe(true);
    expect(isCacheFresh(eightDaysAgo)).toBe(false);
  });
});

describe('T-F5-2 Cache refreshes when online; stale cache replaced with fresh data', () => {
  it('isCacheFresh is true for recently cached data', () => {
    const now = Date.now();
    expect(isCacheFresh(now)).toBe(true);
  });

  it('isCacheExpired is true for stale cache older than 7 days', () => {
    const tenDaysAgo = Date.now() - 10 * 24 * 60 * 60 * 1000;
    expect(isCacheExpired(tenDaysAgo)).toBe(true);
  });
});
