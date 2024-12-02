import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientMqtt } from '@nestjs/microservices';
import { ClickhouseService, WsConfigService } from '@weishour/core/services';
import { MQTT_SERVICE } from '@weishour/core/constants';
import { TimeUtil } from '@weishour/core/utils';
import { UserEntity } from '@ws/app/systems/users/user.entity';
import { Internationalization } from '@syncfusion/ej2-base';
import { EntityManager, Repository } from 'typeorm';
import { toLower, omit, keys, values } from 'lodash';

@Injectable()
export class TransportService {
  /** 实体管理器 */
  manager: EntityManager;
  /** 客户标识 */
  customer: string;
  /** 采集最新数据表名 */
  LAST: string;
  /** 采集记录数据表名 */
  DATA: string;
  /** 多少秒记录一次采集记录数据 */
  DATA_SEC: number;
  /** 主键字段 */
  PRIMARY: string;
  /** 资产编号字段 */
  ASSET_CODE: string;
  /** 设备编号字段 */
  DEVICE_CODE: string;
  /** 设备状态字段 */
  DEVICE_STATUS: string;
  /** 设备能耗字段 */
  DEVICE_ENERGY: string;
  /** 记录时间字段 */
  TIME: string;
  /** 记录次数 */
  data_count: number;

  /** 数字格式化 */
  intl: Internationalization = new Internationalization();
  nFormatter = this.intl.getNumberFormat({ format: '####.####' });

  constructor(
    @Inject(MQTT_SERVICE) private client: ClientMqtt,
    @InjectRepository(UserEntity) private usersRepository: Repository<UserEntity>,
    private clickhouseService: ClickhouseService,
    private wsConfigService: WsConfigService,
    private timeUtil: TimeUtil,
  ) {
    this.manager = this.usersRepository.manager;

    const mqttOption = this.wsConfigService.get('mqtt');
    this.customer = toLower(mqttOption.customer);

    const config = this.wsConfigService.envConfig;
    this.LAST = config.COLLECTION_LAST;
    this.DATA = config.COLLECTION_DATA;
    this.DATA_SEC = +config.COLLECTION_DATA_SEC;
    this.PRIMARY = config.COLLECTION_PRIMARY;
    this.ASSET_CODE = config.COLLECTION_ASSET_CODE;
    this.DEVICE_CODE = config.COLLECTION_DEVICE_CODE;
    this.DEVICE_STATUS = config.COLLECTION_DEVICE_STATUS;
    this.DEVICE_ENERGY = config.COLLECTION_DEVICE_ENERGY;
    this.TIME = config.COLLECTION_TIME;

    this.data_count = +config.COLLECTION_DATA_SEC;
  }

  // ----------------------------------------------------------------------------
  // @ 设备数据写入数据库处理
  // ----------------------------------------------------------------------------

  /**
   * 设备遥测数据处理
   * @param topic
   * @param payload
   */
  async telemetryHandle(topic: string, payload: any): Promise<void> {
    // 主题验证判断
    const topicArray = topic.split('/');
    if (topicArray[1] !== this.customer) return;

    // 数据处理
    for (const asset in payload) {
      // 资产的设备对象
      const deviceDatas = payload[asset];
      const cDatas = [];

      // 整理设备数据
      for (const device in deviceDatas) {
        // 设备的数据对象
        const datas: { [key: string]: any } = deviceDatas[device];

        // 查询记录是否存在（资产&设备）
        const lastDatas = await this.manager.query(
          `SELECT * FROM ${this.LAST} WHERE ${this.ASSET_CODE} = ${asset} AND ${this.DEVICE_CODE} = ${device} LIMIT 1`,
        );

        // 整理采集数据
        const cData: { [key: string]: any } = {
          id: `${asset}${device}`,
          [this.ASSET_CODE]: +asset,
          [this.DEVICE_CODE]: +device,
          [this.TIME]: this.timeUtil.dateFormat(),
        }; // 采集数据

        let active = false; // 设备状态

        for (const field in datas) {
          const fieldArray = field.split('-');

          if (fieldArray.length == 1) {
            // 属性字段
            switch (field) {
              case 'active':
                active = datas[field];
                break;
            }
          } else {
            // 数据字段
            const codeNum = fieldArray[0];
            const num = codeNum.substring(1);
            let fieldFull = num;

            if (codeNum.startsWith('s')) {
              fieldFull = `${this.DEVICE_STATUS}${num}`;
            } else if (codeNum.startsWith('e')) {
              fieldFull = `${this.DEVICE_ENERGY}${num}`;
            }

            cData[fieldFull] = datas[field];
          }
        }

        // 额外处理
        for (const key in cData) {
          if (key.startsWith('status')) {
            // 当设备离线时，状态数值置为0
            if (!active) cData[key] = 0;
          }
        }

        // 实时数据处理
        if (lastDatas.length === 0) {
          // 插入
          try {
            const fields = keys(cData).join(',');
            const vals = values(cData).join("','");
            await this.manager.query(`INSERT INTO ${this.LAST}(${fields}) VALUES('${vals}')`);
          } catch (error) {
            console.log(`插入采集最新数据错误：${error.message}`);
          }
        } else {
          // 更新
          const lastData = lastDatas[0];
          const ckeys = keys(cData);
          let sqlStr = '';

          // 更新语句处理
          for (let i = 0; i < ckeys.length; i++) {
            const key = ckeys[i];
            const value = key === this.TIME ? `'${cData[key]}'` : cData[key];

            sqlStr += `${key} = ${value}`;

            // 判断是否为最后一个元素，如果不是则添加逗号
            if (i < ckeys.length - 1) sqlStr += ', ';
          }

          try {
            await this.manager.query(
              `UPDATE ${this.LAST} SET ${sqlStr} WHERE ${this.PRIMARY} = ${lastData[this.PRIMARY]}`,
            );
          } catch (error) {
            console.log(`更新采集最新数据错误：${error.message}`);
          }
        }

        // 去除多余的字段
        cDatas.push(omit(cData, [this.PRIMARY, this.ASSET_CODE]));
      }

      // 间隔设定时长记录一次采集记录数据
      if (this.data_count == this.DATA_SEC) {
        try {
          // 采集记录数据
          const result = await this.clickhouseService.chClient.insert({
            table: this.DATA + asset,
            values: cDatas,
            format: 'JSONEachRow',
          });
          if (result.executed) {}
          // await this.clickhouseService.query(
          //   `INSERT INTO ${this.DATA + asset} FORMAT JSONEachRow${JSON.stringify(cDatas)}`,
          // );
        } catch (error) {
          console.log(`插入采集记录数据错误：${error.message}`);
        }
      }
    }

    // 每间隔设定次数记录
    if (this.data_count >= 1 && this.data_count < this.DATA_SEC) {
      this.data_count++;
    } else {
      this.data_count = 1;
    }
  }
}
