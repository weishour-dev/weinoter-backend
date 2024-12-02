import { Module } from '@nestjs/common';
import { CoreModule } from '@weishour/core';
import { HttpQweatherModule } from '@weishour/core/modules';
import { HttpQweatherService } from '@weishour/core/services';
import { QweatherController } from './qweather.controller';
import { QweatherService } from './qweather.service';

@Module({
  imports: [CoreModule, HttpQweatherModule],
  controllers: [QweatherController],
  providers: [HttpQweatherService, QweatherService],
  exports: [QweatherService],
})
export class QweatherModule {}
