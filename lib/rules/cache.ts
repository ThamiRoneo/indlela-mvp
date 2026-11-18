export const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // BR8: cache top ranks/routes for 7 days

export function isCacheExpired(cachedAt: number | null, ttlMs: number = CACHE_TTL_MS): boolean {
  if (cachedAt == null) return true;
  return Date.now() - cachedAt > ttlMs;
}

export function isCacheFresh(cachedAt: number | null, ttlMs: number = CACHE_TTL_MS): boolean {
  return !isCacheExpired(cachedAt, ttlMs);
}
