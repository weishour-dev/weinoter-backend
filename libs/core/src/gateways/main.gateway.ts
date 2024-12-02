import { Logger, UseGuards } from '@nestjs/common';
import {
  MessageBody,
  ConnectedSocket,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SocketAuthGuard } from '@weishour/core/guards';
import { Result } from '@weishour/core/interfaces';
import { success, error } from '@weishour/core/utils';
// import { DeviceCollectionDto } from '@ws/app/monitoring/dtos';
import { RedisService } from '@songkeys/nestjs-redis';
import { Server, Socket } from 'socket.io';
import { isNull, isUndefined } from 'lodash';

@WebSocketGateway({
  namespace: 'ws',
  cors: {
    origin: '*',
  },
  transports: ['websocket'],
})
export class MainGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private redisService: RedisService,
    private eventEmitter: EventEmitter2,
  ) {}

  @WebSocketServer()
  server: Server;

  // ----------------------------------------------------------------------------
  // @ socket生命周期
  // ----------------------------------------------------------------------------

  afterInit() {
    new Logger('Ws-Service', { timestamp: true }).log(`Socket服务器已经启动`);
  }

  handleConnection(socket: Socket) {
    new Logger('Socket服务器').debug(`${socket.id} 上线！`);
  }

  handleDisconnect(socket: Socket) {
    new Logger('Socket服务器').debug(`${socket.id} 下线！`);
  }

  // ----------------------------------------------------------------------------
  // @ 数据采集事件
  // ----------------------------------------------------------------------------

  // /**
  //  * 发送获取设备总览信息
  //  * @param deviceCollectionDto
  //  * @param client
  //  * @returns
  //  */
  // @UseGuards(SocketAuthGuard)
  // @SubscribeMessage('device_collection')
  // async deviceCollection(
  //   @MessageBody() deviceCollectionDto: DeviceCollectionDto,
  //   @ConnectedSocket() client: Socket,
  // ): Promise<Result> {
  //   const data = await this.eventEmitter.emitAsync('device.collection', deviceCollectionDto);
  //   const result = data[0];

  //   if (!isNull(result)) {
  //     if (typeof result === 'string') {
  //       client.emit('device_collection', []);
  //       return error(result);
  //     } else {
  //       client.emit('device_collection', result);
  //       return success(`获取资产『${deviceCollectionDto.code}』设备总览信息成功!`);
  //     }
  //   } else {
  //     return error(`获取资产『${deviceCollectionDto.code}』设备总览信息失败!`);
  //   }
  // }

  // /**
  //  * 发送获取设备状态或能耗数据
  //  * @param deviceCollectionDto
  //  * @param client
  //  * @returns
  //  */
  // @UseGuards(SocketAuthGuard)
  // @SubscribeMessage('device_status_energy')
  // async deviceStatusAndEnergy(
  //   @MessageBody() deviceCollectionDto: DeviceCollectionDto,
  //   @ConnectedSocket() client: Socket,
  // ): Promise<Result> {
  //   const data = await this.eventEmitter.emitAsync('device.status_energy', deviceCollectionDto);
  //   const result = data[0];

  //   if (!isNull(result)) {
  //     if (typeof result === 'string') {
  //       client.emit('device_status_energy', []);
  //       return error(result);
  //     } else {
  //       client.emit('device_status_energy', result);
  //       return success(`获取资产『${deviceCollectionDto.code}』设备状态和能耗数据成功!`);
  //     }
  //   } else {
  //     return error(`获取资产『${deviceCollectionDto.code}』设备状态和能耗数据失败!`);
  //   }
  // }

  // /**
  //  * 发送获取实时设备状态或能耗数据
  //  * @param deviceCollectionDto
  //  * @param client
  //  * @returns
  //  */
  // @UseGuards(SocketAuthGuard)
  // @SubscribeMessage('device_status_energy_current')
  // async deviceStatusAndEnergyCurrent(
  //   @MessageBody() deviceCollectionDto: DeviceCollectionDto,
  //   @ConnectedSocket() client: Socket,
  // ): Promise<Result> {
  //   const data = await this.eventEmitter.emitAsync('device.status_energy_current', deviceCollectionDto);
  //   const result = data[0];

  //   if (!isNull(result)) {
  //     if (typeof result === 'string') {
  //       client.emit('device_status_energy_current', []);
  //       return error(result);
  //     } else {
  //       client.emit('device_status_energy_current', result);
  //       return success(`获取实时资产『${deviceCollectionDto.code}』设备状态和能耗数据成功!`);
  //     }
  //   } else {
  //     return error(`获取实时资产『${deviceCollectionDto.code}』设备状态和能耗数据失败!`);
  //   }
  // }

  // /**
  //  * 发送获取实时设备状态或能耗数据
  //  * @param deviceCollectionDto
  //  * @param client
  //  * @returns
  //  */
  // @UseGuards(SocketAuthGuard)
  // @SubscribeMessage('device_status_energy_last')
  // async deviceStatusAndEnergyLast(
  //   @MessageBody() deviceCollectionDto: DeviceCollectionDto,
  //   @ConnectedSocket() client: Socket,
  // ): Promise<Result> {
  //   const data = await this.eventEmitter.emitAsync('device.status_energy_last', deviceCollectionDto);
  //   const result = data[0];

  //   if (!isNull(result) && !isUndefined(result)) {
  //     if (typeof result === 'string') {
  //       client.emit('device_status_energy_last', []);
  //       return error(result);
  //     } else {
  //       client.emit('device_status_energy_last', result);
  //       return success(`获取实时资产『${deviceCollectionDto.code}』设备状态和能耗数据成功!`);
  //     }
  //   } else {
  //     return error(`获取实时资产『${deviceCollectionDto.code}』设备状态和能耗数据失败!`);
  //   }
  // }
}
