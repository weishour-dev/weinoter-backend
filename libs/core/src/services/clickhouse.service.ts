import { Injectable } from '@nestjs/common';
import { WsConfigService } from '@weishour/core/services/config.service';
import { InjectClickHouse } from '@weishour/core/plugins/clickhouse';
import type { ClickHouseClient } from '@clickhouse/client';

@Injectable()
export class ClickhouseService {
  constructor(
    private wsConfigService: WsConfigService,
    @InjectClickHouse() private readonly client: ClickHouseClient,
  ) {}

  /**
   * 客户端实例
   */
  get chClient(): ClickHouseClient {
    return this.client;
  }

  /**
   * 噪音点采集数据查询
   * @param order
   */
  async noisesCollection<T = any>(order: 'ASC' | 'DESC' = 'DESC', where: string = ''): Promise<T> {
    const { database } = this.wsConfigService.get('clickhouse');
    const resultSet = await this.client.query({
      query: `SELECT type, code, level, insertTime FROM ${database}.ws_noises_collection ${where} ORDER BY insertTime ${order}`,
    });
    const result = await resultSet.json();
    return result.data as T;
  }
}
