import { Controller } from '@nestjs/common';
import { Ctx, MessagePattern, MqttContext, Payload } from '@nestjs/microservices';
import { TransportService } from './transport.service';

@Controller()
export class TransportController {
  constructor(private transportService: TransportService) {}

  /**
   * 接收设备遥测数据
   * @param payload
   * @param context
   */
  @MessagePattern('ws/+/receive')
  getTelemetry(@Payload() payload: any, @Ctx() context: MqttContext) {
    const topic = context.getTopic();
    this.transportService.telemetryHandle(topic, payload);
  }
}
