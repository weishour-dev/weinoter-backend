declare const module: any;

import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AllExceptionsFilter, HttpExceptionFilter, QueryFailedExceptionFilter } from '@weishour/core/filters';
import { LoggingInterceptor, TransformInterceptor } from '@weishour/core/interceptors';
import { WsConfigService, WsLoggerService } from '@weishour/core/services';
import { RedisIoAdapter } from '@weishour/core/adapters';
import { ColorUtil, TimeUtil } from '@weishour/core/utils';
import { AuthModule } from '@ws/app/auth/auth.module';
import { MenusModule } from '@ws/app/systems/menus/menus.module';
import { FilesModule } from '@ws/app/files/files.module';
import { UsersModule } from '@ws/app/systems/users/users.module';
import { AppModule } from '@ws/app/app.module';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
    rawBody: true,
  });

  const wsConfigService = app.get(WsConfigService);
  const colorUtil = app.get(ColorUtil);
  const timeUtil = app.get(TimeUtil);
  const wsLoggerService = app.resolve(WsLoggerService);

  const port = wsConfigService.get<number>('BACKEND_PORT');
  const emqx_enable = !wsConfigService.get<boolean>('EMQX_ENABLE');

  // MQTT微服务
  if (emqx_enable) {
    const mqttOption = wsConfigService.get('mqtt');
    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.MQTT,
      options: {
        url: `mqtt://${mqttOption.host}:${mqttOption.port}`,
        protocolVersion: 5,
        keepalive: 30,
        clientId: `WS-${mqttOption.customer}-NEST`,
        username: mqttOption.username,
        password: mqttOption.password,
        subscribeOptions: { qos: 2, rap: true },
      },
    });
  }

  // 全局前缀
  app.setGlobalPrefix('api');

  // 注册添加请求正文解析
  app.useBodyParser('text');

  // 设置HTTP标头
  app.use(helmet());

  // 全局中间件
  app.use(cookieParser());

  // 全局拦截器
  app.useGlobalInterceptors(new LoggingInterceptor(colorUtil, await wsLoggerService), new TransformInterceptor());

  // 全局过滤器
  app.useGlobalFilters(
    new AllExceptionsFilter(timeUtil, await wsLoggerService),
    new HttpExceptionFilter(timeUtil, await wsLoggerService),
    new QueryFailedExceptionFilter(timeUtil, await wsLoggerService),
  );

  // 网关适配器
  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis();
  app.useWebSocketAdapter(redisIoAdapter);

  // 数据采集文档
  const wsOptions = new DocumentBuilder()
    .setTitle('数据采集接口')
    .setDescription('数据采集服务端API文档')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, '访问令牌')
    .setVersion('1.0')
    .build();

  const wsDocument = SwaggerModule.createDocument(app, wsOptions, {
    include: [AuthModule, FilesModule, UsersModule, MenusModule],
  });

  SwaggerModule.setup('docs/ws', app, wsDocument);

  // 开始监听关闭挂钩
  app.enableShutdownHooks();

  // 启动所有微服务
  await app.startAllMicroservices().then(() => {
    new Logger('Ws-Service').log('微服务正在监听中...');
  });

  // 监听端口
  await app.listen(port).then(() => {
    new Logger('Ws-Service').log(`HTTP服务器已经启动, http://localhost:${port}`);
  });

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
