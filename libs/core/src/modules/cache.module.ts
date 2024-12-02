import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { CacheConfigService } from '@weishour/core/services';

@Module({
  imports: [CacheModule.registerAsync({ useClass: CacheConfigService })],
  exports: [CacheModule],
})
export class WsCacheModule {}
