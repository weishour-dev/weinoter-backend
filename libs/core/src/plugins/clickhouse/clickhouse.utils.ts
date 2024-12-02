import { Logger } from '@nestjs/common';
import { ClickHouseClient } from '@clickhouse/client';
import { CLICKHOUSE_BASE_TOKEN, DEFAULT_CONNECTION_NAME, CLICKHOUSE_CONTEXT } from './clickhouse.constants';
import { difference } from 'lodash';

export const logger = new Logger(CLICKHOUSE_CONTEXT);

const tokens: string[] = [];

export function validateConnectionName(name: string = DEFAULT_CONNECTION_NAME): string {
  if (tokens.includes(name)) {
    throw new Error(`ClickHouse连接名称重复: ${name}`);
  }

  tokens.push(name);
  return name;
}

export function getConnectionToken(name: string = DEFAULT_CONNECTION_NAME): string {
  return `${CLICKHOUSE_BASE_TOKEN}${name}`;
}

/**
 * 初始化表结构
 * @param client
 * @param tables
 */
export const initTables = async (client: ClickHouseClient, tables: string[]): Promise<void> => {
  const { database } = client['connectionParams'];

  const query = `SELECT name FROM system.tables WHERE database = '${database}'`;
  const result = await client.query({ query, format: 'JSON' });
  const { data, rows } = await result.json();
  // 已经存在的表名数组
  const existTables = data.map(table => table['name']);
  // 需要创建的表名数组
  const absentTables = difference(tables, existTables);
  // 创建表
  for (const tableName of absentTables) {
    switch (tableName) {
      case 'ws_noises_collection':
        const createTableQuery = `
          CREATE TABLE ${database}.${tableName}
          (
            \`id\` UUID DEFAULT generateUUIDv4() COMMENT '主键',
            \`type\` String COMMENT '类型',
            \`code\` UInt32 COMMENT '编号',
            \`level\` Decimal(6, 2) COMMENT '等效声压级',
            \`spectrum\` String COMMENT '频谱(50~349hz)',
            \`insertTime\` DateTime('Asia/Shanghai') DEFAULT now() COMMENT '记录时间'
          )
          ENGINE = MergeTree
          PRIMARY KEY id
          ORDER BY (id, insertTime)
          PARTITION BY toYYYYMM(insertTime)
          TTL insertTime + toIntervalMonth(6)
          SETTINGS index_granularity = 8192
          COMMENT '噪音点采集数据';
        `;
        try {
          await client.command({ query: createTableQuery });
        } catch (error) {
          throw new Error(`ClickHouse创建表『${tableName}』失败: ${error.code}`);
        }
        break;
    }
  }
};
