type CacheValue = {
  data: any;
  expireAt: number;
};

const memoryCache = new Map<string, CacheValue>();

export function getCache(key: string) {
  const cached = memoryCache.get(key);
  if (!cached) return null;

  if (Date.now() > cached.expireAt) {
    memoryCache.delete(key);
    return null;
  }

  return cached.data;
}

export function setCache(
  key: string,
  data: any,
  ttlSeconds: number
) {
  memoryCache.set(key, {
    data,
    expireAt: Date.now() + ttlSeconds * 1000,
  });
}