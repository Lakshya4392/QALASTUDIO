import { Request, Response, NextFunction } from 'express';

interface CacheEntry {
  data: any;
  etag: string;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();

/**
 * In-memory cache with TTL.
 * Works as middleware: caches GET responses based on URL + query params.
 * Also sets Cache-Control headers for browser/proxy CDN caching.
 */
export function cacheMiddleware(ttlSeconds: number = 60) {
  return (_req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (_req.method !== 'GET') return next();

    const key = _req.originalUrl || _req.url;
    const entry = cache.get(key);

    if (entry && Date.now() - entry.timestamp < ttlSeconds * 1000) {
      // Set headers for client cache too
      res.setHeader('Cache-Control', `public, max-age=${Math.max(ttlSeconds - 10, 10)}, stale-while-revalidate=${ttlSeconds}`);
      res.setHeader('ETag', entry.etag);
      res.setHeader('X-Cache', 'HIT');

      // Handle If-None-Match (browser cache validation)
      const ifNoneMatch = _req.headers['if-none-match'];
      if (ifNoneMatch && ifNoneMatch === entry.etag) {
        return res.status(304).end();
      }

      // Handle If-Modified-Since
      const ifModifiedSince = _req.headers['if-modified-since'];
      if (ifModifiedSince) {
        const date = new Date(ifModifiedSince);
        if (entry.timestamp <= date.getTime()) {
          return res.status(304).end();
        }
      }

      return res.json(entry.data);
    }

    // Intercept res.json to store in cache
    const originalJson = res.json.bind(res);

    res.json = (body: any) => {
      // Don't cache error responses
      if (res.statusCode >= 400) return originalJson(body);

      const etag = `"${Date.now()}-${Math.random().toString(36).slice(2, 8)}"`;
      cache.set(key, {
        data: body,
        etag,
        timestamp: Date.now(),
      });

      res.setHeader('Cache-Control', `public, max-age=${Math.max(ttlSeconds - 10, 10)}, stale-while-revalidate=${ttlSeconds}`);
      res.setHeader('ETag', etag);
      res.setHeader('Last-Modified', new Date().toUTCString());
      res.setHeader('X-Cache', 'MISS');

      return originalJson(body);
    };

    next();
  };
}

/**
 * Invalidate cache entry by URL pattern.
 * Call this after any mutation (PUT/POST/DELETE) that affects cached data.
 */
export function invalidateCache(urlPattern: string): void {
  // Support wildcard matching for patterns like "/api/content/*"
  const regex = new RegExp(`^${urlPattern.replace(/\*/g, '.*')}`);

  for (const key of cache.keys()) {
    if (regex.test(key)) {
      cache.delete(key);
    }
  }
}

/**
 * Clear the entire cache (e.g., after major schema changes).
 */
export function clearCache(): void {
  cache.clear();
}

/**
 * Periodic cleanup of expired entries to prevent memory leaks.
 * Returns interval ID for scheduling.
 */
export function startCacheCleanup(intervalMs: number = 5 * 60 * 1000): NodeJS.Timeout {
  return setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of cache.entries()) {
      if (now - entry.timestamp > 10 * 60 * 1000) {
        // Default max TTL is 10 min for cleanup sweep
        cache.delete(key);
      }
    }
  }, intervalMs);
}
