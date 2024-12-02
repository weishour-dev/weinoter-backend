// import { HttpService } from '@nestjs/axios';
// import { ClickhouseService, WsConfigService } from '@weishour/core/services';

// export const ClickhouseProviders = [
//   {
//     provide: 'CLICKHOUSE_DEFAULT',
//     useFactory: (httpService: HttpService, wsConfigService: WsConfigService) => {
//       return new ClickhouseService(httpService, wsConfigService.get('clickhouse'));
//     },
//     inject: [HttpService, WsConfigService],
//   },
// ];
