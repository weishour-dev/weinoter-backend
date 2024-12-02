import { Injectable } from '@nestjs/common';
import { TimeUtil } from '@weishour/core/utils/time.util';
import { CustomCodeOptions } from '@weishour/core/interfaces';
import { randomBytes } from 'crypto';

@Injectable()
export class RandomUtil {
  constructor(private timeUtil: TimeUtil) {}

  /**
   * 加密安全的随机数生成
   */
  cryptoRandom(): number {
    // 生成4个字节的随机字节并解析为无符号32位大端整数
    const randomValue: number = randomBytes(4).readUInt32BE(0);

    // 归一化到0到1之间
    return randomValue / Math.pow(2, 32);
  }

  /**
   * 生成一个指定长度和字符范围的随机ID
   * @param length 指定生成的ID的长度，默认值为12
   * @param scope 用于生成ID的字符范围，默认是大写字母和数字
   * @returns 返回生成的随机ID字符串
   */
  idGenerate(length: number = 12, scope: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'): string {
    let str = ''; // 存储生成的字符串
    const l = scope.length; // 字符范围的长度

    // 逐字符生成随机ID，字符从给定的scope中随机选择
    for (let i = 0; i < length; i++) {
      str += scope.charAt(Math.floor(Math.random() * l)); // 随机选择字符并追加到str中
    }

    return str;
  }

  /**
   * 自定义编号
   * @param customOption
   */
  customCode(customOption?: CustomCodeOptions): string {
    // 获取customOption对象中的uniqueId或默认值34835，作为乘数使用
    const multiply = customOption?.uniqueId || 34835;

    // 生成一个不太安全的随机数
    const crypticNotSecure = Math.floor(Math.random() * multiply);

    // 使用cryptoRandom生成一个加密安全的随机数
    const crypticSecureFun = this.cryptoRandom() * multiply;

    // 取整生成的安全随机数
    const crypticSecure = Math.floor(crypticSecureFun);

    // 获取随机字符串的长度，默认值为1
    const length = customOption?.randomLength || 1;

    // 生成第一个部分ID，根据安全随机数或者不安全随机数生成
    const firstId = this.idGenerate(length, crypticSecure.toString() || crypticNotSecure.toString());

    // 根据传入的name字段生成部分ID，如果没有提供name，则使用默认的字母范围
    let name: string;
    if (customOption?.name) {
      // 过滤掉name字段中的特殊字符，仅保留字母和数字
      name = this.idGenerate(length, customOption.name.replace(/[^a-zA-Z0-9]/g, '') || '');
    } else {
      // 如果没有提供name，使用默认的大写字母集生成
      name = this.idGenerate(length, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    }

    // 根据传入的email字段生成部分ID，如果没有提供email，则使用默认的字母范围
    let email: string;
    if (customOption?.email) {
      // 过滤掉email字段中的特殊字符，仅保留字母和数字
      email = this.idGenerate(length, customOption.email.replace(/[^a-zA-Z0-9]/g, '') || '');
    } else {
      // 如果没有提供email，使用默认的大写字母集生成
      email = this.idGenerate(length, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    }

    // 根据传入的prefix字段生成部分ID
    let prefix = '';
    if (customOption?.prefix) prefix = customOption.prefix;

    // 根据传入的dateFormat字段生成部分ID
    let date: string;
    if (customOption?.isDate !== false) {
      date = this.timeUtil.dateFormat(new Date(), customOption?.dateFormat || 'yyMMddHH');
    }

    // 生成最后一部分ID，使用安全或不安全的随机数生成
    const lastId = this.idGenerate(length, crypticSecure.toString() || crypticNotSecure.toString());

    // 将所有部分组合成最终结果
    const result = prefix + date + name + firstId + email + lastId;

    // 根据lowerCase选项决定返回的大写或小写结果
    return customOption?.lowerCase ? result.toLowerCase() : result.toUpperCase();
  }
}
