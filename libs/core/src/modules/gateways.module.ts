import { Module } from '@nestjs/common';
import { MainGateway } from '@weishour/core/gateways';
import { WsJwtModule } from './jwt.module';

@Module({
  imports: [WsJwtModule],
  providers: [MainGateway],
})
export class GatewaysModule {}
