import { registerAs } from '@nestjs/config';

export const MqttConfig = registerAs('mqtt', () => ({
  customer: process.env.IOT_CUSTOMER,
  name: process.env.EMQX_NODE,
  host: process.env.EMQX_HOST,
  port: process.env.EMQX_PORT,
  username: process.env.EMQX_USERNAME,
  password: process.env.EMQX_PASSWORD,
}));
