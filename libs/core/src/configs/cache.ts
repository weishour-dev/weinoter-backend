import { registerAs } from '@nestjs/config';

export const CacheConfig = registerAs('cache', () => ({
  ttl: +process.env.CACHE_TTL,
  max: +process.env.CACHE_MAX,
}));
