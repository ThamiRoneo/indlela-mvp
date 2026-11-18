import { isStale, daysAgo, DAILY_REPORT_LIMIT, dailyLimitReached, fuelPriceChangePct, shouldFuelAlert } from '../../lib/rules/fare';

describe('T-BR2-1 Fare staleness (valid within 14 days, else stale)', () => {
  it('fare reported within 14 days is not stale', () => {
    const recent = new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString();
    expect(isStale(recent)).toBe(false);
  });

  it('fare reported exactly 14 days ago is still valid', () => {
    const boundary = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
    expect(isStale(boundary)).toBe(false);
  });

  it('fare reported 15 days ago is stale', () => {
    const old = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString();
    expect(isStale(old)).toBe(true);
  });

  it('daysAgo returns correct day count', () => {
    const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
    expect(daysAgo(tenDaysAgo)).toBe(10);
  });
});

describe('T-BR3-1 Daily fare report limit (max 5 per user per day)', () => {
  it('allows up to 5 reports today', () => {
    expect(dailyLimitReached(0)).toBe(false);
    expect(dailyLimitReached(4)).toBe(false);
  });

  it('rejects the 6th report once 5 exist today', () => {
    expect(dailyLimitReached(5)).toBe(true);
    expect(dailyLimitReached(6)).toBe(true);
  });

  it('DAILY_REPORT_LIMIT is 5', () => {
    expect(DAILY_REPORT_LIMIT).toBe(5);
  });
});

describe('T-BR7-1 Fuel price alert (up >= 5% in 30 days)', () => {
  it('fuelPriceChangePct calculates percentage change', () => {
    expect(fuelPriceChangePct(21, 20)).toBeCloseTo(5, 1);
    expect(fuelPriceChangePct(30, 20)).toBeCloseTo(50, 1);
  });

  it('shouldFuelAlert is true when change >= 5%', () => {
    expect(shouldFuelAlert(5)).toBe(true);
    expect(shouldFuelAlert(6)).toBe(true);
    expect(shouldFuelAlert(4.9)).toBe(false);
    expect(shouldFuelAlert(0)).toBe(false);
  });
});
