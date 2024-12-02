import { Injectable } from '@nestjs/common';
import { Result } from '@weishour/core/interfaces';
import { QweatherApiLink } from '@weishour/core/configs';
import { HttpQweatherService } from '@weishour/core/services';
import { WeatherNowResult } from '@ws/common/interfaces';
import { QweatherCommonDto } from './dtos';

@Injectable()
export class QweatherService {
  constructor(private httpQweatherService: HttpQweatherService) {}

  /**
   * 城市天气 - 实时天气
   * @param {QweatherCommonDto} query
   */
  weatherNow = (query: QweatherCommonDto): Promise<Result<WeatherNowResult>> => {
    return this.httpQweatherService.get(QweatherApiLink.weather.now, query);
  };
}
