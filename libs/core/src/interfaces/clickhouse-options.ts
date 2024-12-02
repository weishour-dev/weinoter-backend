import { ClickHouseCompressionMethod, ClickHouseConnectionProtocol, ClickHouseDataFormat } from '@weishour/core/enums';
import * as http from 'http';
import * as https from 'https';

export class ClickHouseSettings {
  /**
   * 在 clickhouse-server 响应中启用或禁用 X-ClickHouse-Progress HTTP 响应标头。
   *
   * 默认值：0
   */
  public send_progress_in_http_headers?: 0 | 1 = 0;

  /**
   * 您可以在服务器端启用响应缓冲。为此目的提供了 buffer_size 和 wait_end_of_query URL 参数。
   * buffer_size 确定结果中要在服务器内存中缓冲的字节数。
   *
   * 如果结果正文大于此阈值，则将缓冲区写入 HTTP 通道，并将剩余数据直接发送到 HTTP 通道。
   * 要确保缓冲整个响应，请设置 wait_end_of_query=1。在这种情况下，未存储在内存中的数据将缓存在临时服务器文件中。
   *
   * 默认值：1
   */
  public wait_end_of_query?: 0 | 1 = 1;

  /**
   * 您可以在服务器端启用响应缓冲。为此目的提供了 buffer_size 和 wait_end_of_query URL 参数。
   * buffer_size 确定结果中要在服务器内存中缓冲的字节数。
   *
   * 如果结果正文大于此阈值，则将缓冲区写入 HTTP 通道，并将剩余数据直接发送到 HTTP 通道。
   * 要确保缓冲整个响应，请设置 wait_end_of_query=1。在这种情况下，未存储在内存中的数据将缓存在临时服务器文件中。
   *
   * 默认值：1048576
   */
  public buffer_size?: number = 1048576;
}

export class ClickHouseClientOptions {
  /**
   * ClickHouse服务器标识符
   *
   * 默认值: CLICKHOUSE_DEFAULT
   */
  public name?: string = 'CLICKHOUSE_DEFAULT';

  /**
   * ClickHouse主机
   *
   * 默认值: 127.0.0.1
   */
  public host?: string = '127.0.0.1';

  /**
   * ClickHouse端口
   *
   * 默认值: 8123
   */
  public port?: number = 8123;

  /**
   * ClickHouse用户名
   *
   * 默认值: default
   */
  public username?: string = 'default';

  /**
   * ClickHouse密码
   *
   * 默认值: <empty>
   */
  public password?: string = '';

  /**
   * ClickHouse数据库
   *
   * 默认值: default
   */
  public database?: string = 'default';

  /**
   * HTTP接口协议
   *
   * 默认值: HTTP
   */
  public protocol?: ClickHouseConnectionProtocol = ClickHouseConnectionProtocol.HTTP;

  /**
   * HTTP代理
   *
   * `httpAgent` 定义了在 node.js 中执行 http 请求时要使用的自定义代理。
   * 这允许添加默认情况下未启用的选项，例如 `keepAlive`。
   *
   * 默认值: `undefined`
   */
  public httpAgent?: http.Agent;

  /**
   * HTTPS代理
   *
   * `httpsAgent` 定义了在 node.js 中执行 https 请求时要使用的自定义代理
   * 这允许添加默认情况下未启用的选项，例如 `keepAlive`。
   *
   * 默认值: `undefined`
   */
  public httpsAgent?: https.Agent;

  /**
   * HTTP接口压缩方式
   *
   * 默认值: NONE
   */
  public compression?: ClickHouseCompressionMethod = ClickHouseCompressionMethod.NONE;

  /**
   * 输入输出数据格式
   *
   * 默认值: JSON
   */
  public format?: ClickHouseDataFormat = ClickHouseDataFormat.JSON;

  /**
   * HTTP接口连接设置
   */
  public settings?: ClickHouseSettings = new ClickHouseSettings();

  /**
   * ClickHouse连接选项
   */
  constructor() {
    if (this.settings) {
      this.settings = Object.assign(new ClickHouseSettings(), this.settings);
    }
  }
}
