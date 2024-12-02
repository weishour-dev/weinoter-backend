import { Predicate } from '@syncfusion/ej2-data';

export interface WsPredicate {
  condition?: string;
  field?: string;
  operator?: string;
  value?: string | number | Date | boolean | Predicate | Predicate[] | null;
}

export { Predicate } from '@syncfusion/ej2-data';

/**
 * 自定义数据服务的排序属性
 */
export interface Sorts {
  /** 排序字段 */
  name?: string;
  /** 排序方向 */
  direction?: 'ASC' | 'DESC';
}

/** 数据状态参数 */
export interface DataStateArgs {
  /** 数据源记录中的跳过计数 */
  skip?: number;
  /** 页面大小 */
  take?: number;
  /** 过滤条件  */
  where?: Predicate[];
  /** 排序字段和方向 */
  sorted?: Sorts[];
  /** 分组字段名称 */
  group?: string[];
  /** 聚合对象 */
  aggregates?: Object[];
  /** 远程表名称 */
  table?: string;
  /** 选定的字段名称 */
  select?: string[];
  /** 如果 count 设置为 true，则远程服务需要返回记录和计数 */
  requiresCounts?: boolean;
}
