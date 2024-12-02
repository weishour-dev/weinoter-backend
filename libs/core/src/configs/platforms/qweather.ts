import { registerAs } from '@nestjs/config';

export const QweatherConfig = registerAs('qweather', () => ({
  key: process.env.QWEATHER_KEY,
  url: process.env.QWEATHER_URL,
  location: process.env.QWEATHER_LOCATION,
}));

/**
 * 和风天气服务端API链接
 */
export const QweatherApiLink = {
  /* 城市天气 */
  weather: {
    /* 实时天气 */
    now: 'weather/now',
    /* 每日天气预报 */
    '3d': 'weather/3d',
    '7d': 'weather/7d',
    /* 逐小时天气预报 */
    '24h': 'weather/24h',
  },
  /* 分钟预报 */
  minutely: {
    /* 分钟级降水 */
    '5m': 'minutely/5m',
  },
  /* 格点天气 */
  'grid-weather': {
    /* 格点实时天气 */
    now: 'grid-weather/now',
    /* 格点每日天气预报 */
    '3d': 'grid-weather/3d',
    '7d': 'grid-weather/7d',
    /* 格点逐小时天气预报 */
    '24h': 'grid-weather/24h',
  },
  /* 预警 */
  warning: {
    /* 天气灾害预警 */
    now: 'warning/now',
    /* 天气预警城市列表 */
    list: 'warning/list',
  },
  /* 天气指数 */
  indices: {
    /* 天气指数预报 */
    '1d': 'indices/1d',
    '3d': 'indices/3d',
  },
  /* 空气质量 */
  air: {
    /* 实时空气质量 */
    now: 'air/now',
    /* 空气质量每日预报 */
    '5d': 'air/5d',
  },
  /* 天文 */
  astronomy: {
    /* 日出日落 */
    sun: 'astronomy/sun',
    /* 月升月落和月相 */
    moon: 'astronomy/moon',
    /* 太阳高度角 */
    'solar-elevation-angle': 'astronomy/solar-elevation-angle',
  },
};
