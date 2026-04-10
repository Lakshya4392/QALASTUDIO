import Redis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

const redisUrl = process.env.REDIS_URL;

// Only connect if REDIS_URL is explicitly configured
// Avoids crashing on startup when Redis is not available (e.g. Render free tier)
let redis: Redis;

if (redisUrl) {
  redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    enableOfflineQueue: false,
    lazyConnect: true,
    retryStrategy: (times) => {
      if (times > 3) return null; // stop retrying
      return Math.min(times * 500, 2000);
    },
  });
  redis.on('connect', () => console.log('✅ Redis connected'));
  redis.on('error', (err) => console.warn('⚠️  Redis error (non-critical):', err.message));
} else {
  // Stub — all methods return safe defaults so health check doesn't crash
  redis = {
    ping: async () => 'PONG',
    get: async () => null,
    set: async () => 'OK',
    del: async () => 0,
    on: () => {},
    quit: async () => 'OK',
  } as any;
  console.log('ℹ️  Redis not configured — running without cache');
}

export default redis;
