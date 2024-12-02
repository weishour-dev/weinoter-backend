import { ModuleRef } from '@nestjs/core';
import { Inject, Module, BeforeApplicationShutdown } from '@nestjs/common';
import { CLICKHOUSE_TOKEN } from './clickhouse.constants';
import { ClickhouseBaseModule } from './clickhouse-base.module';
import { ClickHouseAsyncOptions, ClickHouseOptions } from './clickhouse.interface';
import { createClientProvider, createTokenProvider } from './clickhouse.provider';
import { getConnectionToken, validateConnectionName } from './clickhouse.utils';
import type { ClickHouseClient } from '@clickhouse/client';


@Module({})
export class ClickHouseModule extends ClickhouseBaseModule implements BeforeApplicationShutdown {
  constructor(
    private readonly moduleRef: ModuleRef,
    @Inject(CLICKHOUSE_TOKEN)
    private readonly clientToken: string,
  ) {
    super();
  }

  static forRoot(options: ClickHouseOptions) {
    const token = validateConnectionName(options.name);
    const tokenProvider = createTokenProvider(token);
    const clientProvider = createClientProvider(token);

    const module = super.forRoot(options);
    module.providers.push(tokenProvider, clientProvider);
    module.exports = [clientProvider];

    return module;
  }

  static forRootAsync(options: ClickHouseAsyncOptions) {
    const token = validateConnectionName(options.name);
    const tokenProvider = createTokenProvider(token);
    const clientProvider = createClientProvider(token);

    const module = super.forRootAsync(options);
    module.providers.push(tokenProvider, clientProvider);
    module.exports = [clientProvider];

    return module;
  }

  async beforeApplicationShutdown() {
    const clickhouse_enable = process.env.CLICKHOUSE_ENABLE;
    if (clickhouse_enable === 'true') {
      const token = getConnectionToken(this.clientToken);
      const client = this.moduleRef.get<ClickHouseClient>(token);
      await client.close();
    }
  }
}
