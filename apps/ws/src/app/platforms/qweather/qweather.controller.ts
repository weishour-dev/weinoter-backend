import { UseGuards, Controller, UseInterceptors, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { JwtAuthGuard } from '@weishour/core/guards';
import { Result } from '@weishour/core/interfaces';
import { QweatherApiLink } from '@weishour/core/configs';
import { WeatherNowResult } from '@ws/common/interfaces';
import { QweatherService } from './qweather.service';
import { QweatherCommonDto } from './dtos';

@ApiTags('和风天气')
@UseGuards(JwtAuthGuard)
@Controller()
@UseInterceptors(CacheInterceptor)
export class QweatherController {
  constructor(private qweatherService: QweatherService) {}

  @Get(QweatherApiLink.weather.now)
  @ApiTags('城市天气')
  @ApiOperation({ summary: '实时天气' })
  weatherNow(@Query() query: QweatherCommonDto): Promise<Result<WeatherNowResult>> {
    return this.qweatherService.weatherNow(query);
  }
}
