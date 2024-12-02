import { Injectable } from '@nestjs/common';
import {
  getTime,
  format,
  differenceInSeconds,
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
  differenceInMonths,
  startOfMonth,
  addMonths,
  endOfMonth,
  startOfDay,
  endOfDay,
  addDays,
  startOfHour,
  endOfHour,
  addHours,
  startOfMinute,
  endOfMinute,
  addMinutes,
} from 'date-fns';
import { zhCN } from 'date-fns/locale';
import ms from 'ms';

@Injectable()
export class TimeUtil {
  /**
   * 获取当前时间戳
   */
  get TimeStamp(): number {
    return getTime(new Date());
  }

  /**
   * 获取当前日期 (YYYY-MM-DD)
   */
  get CurrentDate(): string {
    return format(new Date(), 'yyyy-MM-dd');
  }

  /**
   * 获取当前时间 (YYYY-MM-DD HH:mm:ss)
   */
  get CurrentTime(): string {
    return format(new Date(), 'yyyy-MM-dd HH:mm:ss');
  }

  /**
   * 时间格式化
   *
   * @param date
   * @param fm
   * @returns
   */
  dateFormat = (date: Date = new Date(), fm = 'yyyy-MM-dd HH:mm:ss') => format(date, fm, { locale: zhCN });

  /**
   * 时间格式化
   *
   * @param date
   * @param fm
   * @returns
   */
  dateFormatNum = (date: number, fm = 'yyyy-MM-dd HH:mm:ss') => format(date, fm, { locale: zhCN });

  /**
   * 各种时间格式转换为毫秒
   */
  getMs = (value: string) => ms(value);

  /**
   * 获取最新的时间段
   *
   * @param type
   * @param num
   * @returns
   */
  getLastDateRange = (type = 'hour', num = 1) => {
    let startTime = '';
    const fm = 'yyyy-MM-dd HH:mm:ss';

    switch (type) {
      case 'minute':
        startTime = format(addMinutes(new Date(), -num), fm);
        break;
      case 'hour':
        startTime = format(addHours(new Date(), -num), fm);
        break;
      case 'day':
        startTime = format(addDays(new Date(), -num), fm);
        break;
    }

    return [startTime, this.CurrentTime];
  };

  /**
   * 秒数转换时间显示
   * @param seconds {number}
   */
  secondToDate(seconds: number): string {
    // 计算天数
    const days = seconds / 86400;
    // 计算小时数
    let remain = seconds % 86400;
    const hours = remain / 3600;
    // 计算分钟数
    remain = seconds % 3600;
    const mins = remain / 60;
    // 计算秒数
    const secs = remain % 60;

    if (days >= 1) {
      return `${days.toFixed(2)}天`;
    } else if (hours >= 1) {
      return `${hours.toFixed(2)}小时`;
    } else if (mins >= 1) {
      return `${mins.toFixed(2)}分钟 ${secs}秒`;
    } else {
      return `${seconds}秒`;
    }
  }

  /**
   * 获取两个时间差
   * @param dateLeft {number | Date}
   * @param dateRight {number | Date}
   * @param type {string}
   */
  diffTime(dateLeft: number | Date, dateRight: number | Date, type = ''): string | number {
    const timediff = differenceInSeconds(dateRight, dateLeft);

    // 计算天数
    const days = timediff / 86400;
    // 计算小时数
    let remain = timediff % 86400;
    const hours = remain / 3600;
    // 计算分钟数
    remain = timediff % 3600;
    const mins = remain / 60;
    // 计算秒数
    const secs = remain % 60;

    if (type !== '') {
      switch (type) {
        case 'day':
          return days;
        case 'hour':
          return hours;
        case 'min':
          return mins;
        case 'sec':
          return timediff;
      }
    } else {
      if (days >= 1) {
        return `${differenceInDays(dateRight, dateLeft)}天`;
      } else if (hours >= 1) {
        return `${differenceInHours(dateRight, dateLeft)}小时`;
      } else if (mins >= 1) {
        return `${differenceInMinutes(dateRight, dateLeft)}分钟 ${secs}秒`;
      } else {
        return `${timediff}秒`;
      }
    }
  }

  /**
   * 获取一段时间的时间范围数组
   *
   * @param startTime
   * @param endTime
   * @param isMinute
   * @returns
   */
  dateRangeHandle(
    startTime: string,
    endTime: string,
    isMinute = false,
  ): { dateRanges: { startDate: string; endDate: string }[]; dateType: string } {
    const months = differenceInMonths(new Date(endTime), new Date(startTime)),
      days = differenceInDays(new Date(endTime), new Date(startTime)),
      hours = differenceInHours(new Date(endTime), new Date(startTime)),
      minutes = differenceInMinutes(new Date(endTime), new Date(startTime));
    let dateRanges = [];
    let dateType = 'minute';

    if (months > 0) {
      // 以月为单位的间隔
      const startMonth = startOfMonth(new Date(startTime));

      for (let index = 0; index <= months; index++) {
        const startDate = index === 0 ? new Date(startTime) : addMonths(startMonth, index);
        const endDate = index === months ? new Date(endTime) : endOfMonth(startDate);

        dateRanges.push({
          startDate: this.dateFormat(startDate),
          endDate: this.dateFormat(endDate),
        });
      }

      dateType = 'month';
    } else if (days > 0) {
      // 以天为单位的间隔
      const startDay = startOfDay(new Date(startTime));

      for (let index = 0; index <= days; index++) {
        const startDate = index === 0 ? new Date(startTime) : addDays(startDay, index);
        const endDate = index === days ? new Date(endTime) : endOfDay(startDate);

        dateRanges.push({
          startDate: this.dateFormat(startDate),
          endDate: this.dateFormat(endDate),
        });
      }

      dateType = 'day';
    } else if (hours > 0) {
      // 以时为单位的间隔
      const startHour = startOfHour(new Date(startTime));

      for (let index = 0; index <= hours; index++) {
        const startDate = index === 0 ? new Date(startTime) : addHours(startHour, index);
        const endDate = index === hours ? new Date(endTime) : endOfHour(startDate);

        dateRanges.push({
          startDate: this.dateFormat(startDate),
          endDate: this.dateFormat(endDate),
        });
      }

      dateType = 'hour';
    } else if (minutes > 0) {
      // 以分为单位的间隔
      if (isMinute) {
        const startMinute = startOfMinute(new Date(startTime));

        for (let index = 0; index <= minutes; index++) {
          const startDate = index === 0 ? new Date(startTime) : addMinutes(startMinute, index);
          const endDate = index === minutes ? new Date(endTime) : endOfMinute(startDate);

          dateRanges.push({
            startDate: this.dateFormat(startDate),
            endDate: this.dateFormat(endDate),
          });
        }
      }

      dateType = 'minute';
    } else {
      if (isMinute) dateRanges = [{ startDate: startTime, endDate: endTime }];
    }

    return { dateRanges, dateType };
  }
}
