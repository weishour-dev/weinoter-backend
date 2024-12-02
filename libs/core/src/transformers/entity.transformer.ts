import { ValueTransformer } from 'typeorm';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

/**
 * Date读取格式化
 */
export const DateTransformer: ValueTransformer = {
  to: (value: Date) => value,
  from: (value: Date) => format(value, 'yyyy-MM-dd HH:mm:ss', { locale: zhCN }),
};
