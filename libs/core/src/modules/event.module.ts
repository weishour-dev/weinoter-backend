import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    EventEmitterModule.forRoot({
      // 将其设置为“true”以使用通配符
      wildcard: false,
      // 用于分隔名称空间的分隔符
      delimiter: '.',
      // 如果你想触发newListener事件，把它设为' true '
      newListener: false,
      // 如果你想触发removeListener事件，请将此设置为' true '
      removeListener: false,
      // 可以分配给事件的最大监听器数量
      maxListeners: 10,
      // 当分配的侦听器超过最大数量时，在内存泄漏消息中显示事件名称
      verboseMemoryLeak: false,
      // 如果一个错误事件被触发并且没有监听器，禁用抛出uncaughtException
      ignoreErrors: false,
    }),
  ],
  exports: [EventEmitterModule],
})
export class WsEventEmitterModule {}
