import { registerAs } from '@nestjs/config';

export const ClickhouseConfig = registerAs('clickhouse', () => ({
  protocol: 'http',
  host: process.env.CLICKHOUSE_HOST,
  port: process.env.CLICKHOUSE_PORT,
  username: process.env.CLICKHOUSE_USERNAME,
  password: process.env.CLICKHOUSE_PASSWORD,
  database: process.env.CLICKHOUSE_DATABASE,
}));
