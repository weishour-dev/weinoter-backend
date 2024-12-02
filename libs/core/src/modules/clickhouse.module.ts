import { Module } from '@nestjs/common';
import { WsConfigService, ClickhouseService } from '@weishour/core/services';
import { ClickHouseModule } from '@weishour/core/plugins/clickhouse';
import type { ClickHouseClientConfigOptions } from '@clickhouse/client';
import { pick } from 'lodash';

@Module({
  imports: [
    ClickHouseModule.forRootAsync({
      useFactory: (wsConfigService: WsConfigService) => {
        const clickhouseOption = wsConfigService.get('clickhouse');
        const { protocol, host, port } = clickhouseOption;
        const url = `${protocol}://${host}:${port}`;

        const options: ClickHouseClientConfigOptions = {
          url,
          ...pick(clickhouseOption, ['username', 'password', 'database']),
          application: 'ws',
          compression: {
            response: true,
            request: true,
          },
        };
        return options;
      },
      inject: [WsConfigService],
    }),
  ],
  providers: [ClickhouseService],
  exports: [ClickHouseModule, ClickhouseService],
})
export class WsClickhouseModule {}
