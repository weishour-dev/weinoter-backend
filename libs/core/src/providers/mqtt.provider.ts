import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { WsConfigService } from '@weishour/core/services';
import { MQTT_SERVICE } from '@weishour/core/constants';

export const MqttProviders = [
  {
    provide: MQTT_SERVICE,
    useFactory: (wsConfigService: WsConfigService) => {
      const { port, host, username, password } = wsConfigService.get('mqtt');
      return ClientProxyFactory.create({
        transport: Transport.MQTT,
        options: {
          url: `mqtt://${host}:${port}`,
          protocolVersion: 5,
          keepalive: 30,
          clientId: 'WS-NEST',
          username,
          password,
          subscribeOptions: { qos: 2, rap: true },
        },
      });
    },
    inject: [WsConfigService],
  },
];
