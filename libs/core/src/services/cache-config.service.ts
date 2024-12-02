import { Injectable } from '@nestjs/common';
import { CacheOptionsFactory, CacheModuleOptions } from '@nestjs/cache-manager';
import { WsConfigService } from '@weishour/core/services';
import { redisStore } from 'cache-manager-ioredis-yet';

@Injectable()
export class CacheConfigService implements CacheOptionsFactory {
  constructor(private wsConfigService: WsConfigService) {}

  async createCacheOptions(): Promise<CacheModuleOptions> {
    return {
      isGlobal: true,
      store: await redisStore({
        ...this.wsConfigService.get('redis'),
        ttl: this.wsConfigService.get('cache.ttl'),
      }),
      ...this.wsConfigService.get('cache'),
    };
  }
}
