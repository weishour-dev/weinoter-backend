import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoreModule } from '@weishour/core';
import { MqttProviders } from '@weishour/core/providers';
import { UserEntity } from '@ws/app/systems/users/user.entity';
import { TransportController } from './transport.controller';
import { TransportService } from './transport.service';

@Module({
  imports: [CoreModule, TypeOrmModule.forFeature([UserEntity])],
  controllers: [TransportController],
  providers: [TransportService, ...MqttProviders],
  exports: [TransportService],
})
export class TransportModule {}
