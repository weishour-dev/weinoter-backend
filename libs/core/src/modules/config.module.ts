import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WsConfigService } from '@weishour/core/services';
import {
  AxiosConfig,
  CacheConfig,
  CasbinConfig,
  ClickhouseConfig,
  TypeormConfig,
  MssqlConfig,
  MulterConfig,
  RedisConfig,
  ThrottlerConfig,
  JwtConfig,
  RbacConfig,
  MqttConfig,
  QweatherConfig,
} from '@weishour/core/configs';
import { EnvValidate } from '@weishour/core/validations';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      validate: EnvValidate,
      load: [
        AxiosConfig,
        CacheConfig,
        CasbinConfig,
        ClickhouseConfig,
        TypeormConfig,
        MssqlConfig,
        MulterConfig,
        RedisConfig,
        ThrottlerConfig,
        JwtConfig,
        RbacConfig,
        MqttConfig,
        QweatherConfig,
      ],
      expandVariables: true,
    }),
  ],
  providers: [ConfigService, WsConfigService],
  exports: [ConfigService, WsConfigService],
})
export class WsConfigModule {}
