interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();

export async function cacheGetOrSet<T>(
  key: string,
  factory: () => Promise<T>,
  ttlSeconds = 300
): Promise<T> {
  const now = Date.now();
  const existing = store.get(key) as CacheEntry<T> | undefined;

  if (existing && existing.expiresAt > now) {
    return existing.value;
  }

  const value = await factory();
  store.set(key, { value, expiresAt: now + ttlSeconds * 1000 });
  return value;
}
