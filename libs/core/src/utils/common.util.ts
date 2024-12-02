import { Injectable } from '@nestjs/common';
import { Operator } from '@weishour/core/enums';
import { Predicate, WsPredicate } from '@weishour/core/interfaces';
import { Brackets, ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { drop, last, isUndefined } from 'lodash';

@Injectable()
export class CommonUtil {
  /**
   * 是否实现接口
   * @param data
   * @param prop
   */
  isProps<T>(data: any, prop: string): data is T {
    return typeof (data as T)[prop] !== 'undefined';
  }

  /**
   * 传入对象返回url参数
   * @param {Object} data
   * @returns {string}
   */
  getParam(data: Object): string {
    let url = '';
    for (const k in data) {
      const value = data[k] !== undefined ? data[k] : '';
      url += `&${k}=${encodeURIComponent(value)}`;
    }
    return url ? url.substring(1) : '';
  }

  /**
   * 复杂条件
   * @param queryBuilder
   * @returns {SelectQueryBuilder<Entity>}
   */
  complexWhere<Entity>(where: Predicate[], queryBuilder: SelectQueryBuilder<Entity>): SelectQueryBuilder<Entity> {
    // 数据表别名
    const alias = queryBuilder.alias;

    if (where?.length > 0) {
      where.forEach((predicate, i) => {
        // 判断是否为复杂条件
        if (!predicate.isComplex) {
          const whereResult = this.predicateHandle(predicate, alias, `simple${i + 1}`);
          queryBuilder.andWhere(whereResult.where, whereResult.parameters);
        } else {
          if (predicate.predicates.length > 0) {
            const predicates = this.predicatesHandle(predicate).reverse();
            const firstPredicate = predicates[0];
            const brackets: Brackets[] = [];

            drop(predicates).forEach((pre, j) => {
              const newBrackets = new Brackets(qb => {
                if (j === 0) {
                  const firstResult = this.predicateHandle(firstPredicate, alias, 'complex_first');
                  qb.where(firstResult.where, firstResult.parameters);
                } else {
                  qb.where(brackets[j - 1]);
                }

                const whereResult = this.predicateHandle(pre, alias, `complex${j + 1}`);
                if (pre.condition === 'and') {
                  qb.andWhere(whereResult.where, whereResult.parameters);
                } else {
                  qb.orWhere(whereResult.where, whereResult.parameters);
                }
              });

              brackets.push(newBrackets);
            });

            queryBuilder.andWhere(last(brackets));
          }
        }
      });
    }

    // console.log(queryBuilder.getQueryAndParameters());

    return queryBuilder;
  }

  /**
   * 简单的predicate处理
   * @param predicate
   * @param alias
   */
  private predicateHandle(
    predicate: Predicate | WsPredicate,
    alias: string,
    suffix: string | number = '',
  ): { where: string; parameters?: ObjectLiteral } {
    let where = '';

    const field = predicate.field;
    const operator = predicate.operator;
    const value = predicate.value;

    // 默认等于
    let operatorSql = '=';
    let valueSql = value;

    switch (operator as Operator) {
      // 以指定值开头
      case 'startswith':
        operatorSql = 'LIKE';
        valueSql = `${value}%`;
        break;
      // 以指定值结尾
      case 'endswith':
        operatorSql = 'LIKE';
        valueSql = `%${value}`;
        break;
      // 包含
      case 'contains':
        operatorSql = 'LIKE';
        valueSql = `%${value}%`;
        break;
      // 不等于
      case 'notequal':
        operatorSql = '!=';
        break;
      // 大于
      case 'greaterthan':
        operatorSql = '>';
        break;
      // 大于或等于
      case 'greaterthanorequal':
        operatorSql = '>=';
        break;
      // 小于
      case 'lessthan':
        operatorSql = '<';
        break;
      // 小于或等于
      case 'lessthanorequal':
        operatorSql = '<=';
        break;
    }

    let key = field;
    if (suffix !== 0) key = `key_${suffix}`;

    where = `${alias}.${field} ${operatorSql} :${key}`;

    // 其他条件组装
    const lastIndex = field.lastIndexOf('_');
    const fieldArray = [field.substring(0, lastIndex), field.substring(lastIndex + 1)];
    if (fieldArray.length === 2) {
      const field = fieldArray[0];
      const condition = fieldArray[1];

      switch (operator as Operator) {
        case 'equal':
          switch (condition) {
            // 查询字段(strlist)中包含(str)的结果
            case 'findinset':
              where = `FIND_IN_SET(:${key}, ${alias}.${field})`;
              // 当值为空时（全部）
              if (valueSql === '' || isUndefined(valueSql)) where = '';
              break;
          }
          break;
      }
    }

    return { where, parameters: { [key]: valueSql } };
  }

  /**
   * 复杂的predicates处理
   * @param predicate
   * @param predicates
   * @returns {WsPredicate[]}
   */
  private predicatesHandle(predicate: Predicate, predicates: WsPredicate[] = []): WsPredicate[] {
    if (predicate.isComplex) {
      const predicateFirst = predicate.predicates[0];
      const predicateLast = predicate.predicates[1];

      predicates.push({
        condition: predicate.condition,
        field: predicateLast.field,
        operator: predicateLast.operator,
        value: predicateLast.value,
      });

      this.predicatesHandle(predicateFirst, predicates);
    } else {
      predicates.push({
        field: predicate.field,
        operator: predicate.operator,
        value: predicate.value,
      });
    }

    return predicates.reverse();
  }
}
