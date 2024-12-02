import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { HttpQweatherService, WsConfigService } from '@weishour/core/services';

@Module({
  imports: [
    HttpModule.registerAsync({
      inject: [WsConfigService],
      useFactory: (wsConfigService: WsConfigService) => {
        return {
          ...wsConfigService.get('axios'),
          baseURL: wsConfigService.get('qweather.url'),
        };
      },
    }),
  ],
  providers: [HttpQweatherService],
  exports: [HttpQweatherService],
})
export class HttpQweatherModule {}
