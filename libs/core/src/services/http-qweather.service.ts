import { Injectable, OnModuleInit } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Result } from '@weishour/core/interfaces';
import { WsConfigService } from '@weishour/core/services';
import { map, lastValueFrom } from 'rxjs';

@Injectable()
export class HttpQweatherService implements OnModuleInit {
  constructor(
    private httpService: HttpService,
    private wsConfigService: WsConfigService,
  ) {}

  onModuleInit() {
    // 请求拦截器
    this.httpService.axiosRef.interceptors.request.use(
      request => {
        /** 用户认证key */
        request.params.key = this.wsConfigService.get('qweather.key');
        /** LocationID或者经纬度 */
        request.params.location = request.params.location || this.wsConfigService.get('qweather.location');

        return request;
      },
      error => {
        return Promise.reject(error);
      },
    );

    // 响应拦截器
    this.httpService.axiosRef.interceptors.response.use(
      response => {
        const data = response.data;
        let result: Result = {
          code: 417,
          status: false,
        };

        switch (data.code) {
          case '200':
            result = {
              code: data.code,
              status: true,
              message: '请求成功',
              data: data,
            };
            break;
          case '204':
            result.message = '请求成功，但你查询的地区暂时没有你需要的数据';
            break;
          case '400':
            result.message = '请求错误，可能包含错误的请求参数或缺少必选的请求参数';
            break;
          case '401':
            result.message = '认证失败，可能使用了错误的KEY、数字签名错误、KEY的类型错误';
            break;
          case '402':
            result.message = '超过访问次数或余额不足以支持继续访问服务，你可以充值、升级访问量或等待访问量重置';
            break;
          case '403':
            result.message =
              '无访问权限，可能是绑定的PackageName、BundleID、域名IP地址不一致，或者是需要额外付费的数据';
            break;
          case '404':
            result.message = '查询的数据或地区不存在';
            break;
          case '429':
            result.message = '超过限定的QPM(每分钟访问次数)';
            break;
          case '500':
            result.message = '无响应或超时';
            break;
          default:
            result.message = '请求失败';
            break;
        }

        response.data = result;
        return response;
      },
      error => {
        return Promise.reject(error);
      },
    );
  }

  /**
   * GET请求
   * @param url
   * @param params
   * @returns
   */
  get<T>(url: string, params?: T): Promise<Result> {
    params = { ...params };

    return lastValueFrom(this.httpService.get<Result>(url, { params }).pipe(map(res => res.data)));
  }

  /**
   * POST请求
   * @param url
   * @param data
   * @returns
   */
  post<T>(url: string, data?: T): Promise<Result> {
    return lastValueFrom(this.httpService.post<Result>(url, data).pipe(map(result => result.data)));
  }
}
