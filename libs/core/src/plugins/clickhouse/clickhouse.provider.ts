import { Provider } from '@nestjs/common';
import { createClient } from '@clickhouse/client';
import { CLICKHOUSE_OPTIONS, CLICKHOUSE_TOKEN } from './clickhouse.constants';
import { getConnectionToken, initTables } from './clickhouse.utils';

export function createTokenProvider(name: string): Provider {
  return { provide: CLICKHOUSE_TOKEN, useValue: name };
}

export function createClientProvider(name: string): Provider {
  return {
    inject: [CLICKHOUSE_OPTIONS],
    provide: getConnectionToken(name),
    useFactory: async options => {
      const clickhouse_enable = process.env.CLICKHOUSE_ENABLE;
      if (clickhouse_enable === 'false') return null;

      const client = createClient(options);
      const pingResult = await client.ping();

      // 检查连接
      if (pingResult.success === false) {
        const code = pingResult.error['code'];
        throw new Error(`『${name}』ClickHouse连接失败: ${code}`);
      } else {
        // 检查表创建
        await initTables(client, ['ws_noises_collection']);
      }

      return client;
    },
  };
}
