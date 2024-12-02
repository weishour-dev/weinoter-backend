export enum Operator {
  startswith = 'startswith', // 以指定值开头
  endswith = 'endswith', // 以指定值结尾
  contains = 'contains', // 包含
  equal = 'equal', // 等于
  notequal = 'notequal', // 不等于
  greaterthan = 'greaterthan', // 大于
  greaterthanorequal = 'greaterthanorequal', // 大于或等于
  lessthan = 'lessthan', // 小于
  lessthanorequal = 'lessthanorequal', // 小于或等于
}

export enum Order { ASC = 'ASC', DESC = 'DESC' }
