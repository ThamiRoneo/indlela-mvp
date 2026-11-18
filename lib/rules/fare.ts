export const FARE_STALE_DAYS = 14;
export const DAILY_REPORT_LIMIT = 5;
export const FUEL_ALERT_PCT = 5;

export function daysAgo(createdAt: string | Date): number {
  const diff = Date.now() - new Date(createdAt).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function isStale(createdAt: string | Date): boolean {
  return daysAgo(createdAt) > FARE_STALE_DAYS;
}

export function dailyLimitReached(countToday: number): boolean {
  return countToday >= DAILY_REPORT_LIMIT;
}

export function fuelPriceChangePct(latest: number, average: number): number {
  return ((latest - average) / average) * 100;
}

export function shouldFuelAlert(pctChange: number): boolean {
  return pctChange >= FUEL_ALERT_PCT;
}
