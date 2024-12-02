import { Injectable, Inject } from '@nestjs/common';
import { CASBIN_ENFORCER } from '@weishour/core/plugins/casbin';
import { Enforcer, MatchingFunction } from 'casbin';

/**
 * 提供对Casbin策略管理完全支持的基本API
 */
@Injectable()
export class CasbinManagementService {
  constructor(@Inject(CASBIN_ENFORCER) public readonly enforcer: Enforcer) {}

  /**
   * 强制执行决定“主体”是否可以通过操作“动作”访问“对象”
   * @param params请求参数，通常为（sub、obj、act）
   * @return 请求是否被允许
   */
  enforce(...params: string[]): Promise<boolean> {
    return this.enforcer.enforce(params);
  }

  /**
   * enforceWithMatcher使用自定义匹配器来决定“主体”是否可以通过操作“动作”访问“对象”
   * @param matcher要使用的matcher语句
   * @param params请求参数，通常为（sub、obj、act）
   * @return 请求是否被允许
   */
  enforceWithMatcher(matcher: string, ...params: string[]): Promise<boolean> {
    return this.enforcer.enforceWithMatcher(matcher, params);
  }

  /**
   * enforceEx通过返回匹配的规则来解释执行。
   * @param params请求参数，通常为（sub、obj、act）
   * @return 请求是否被允许，以及是什么策略导致了这一决定
   */
  enforceEx(...params: string[]): Promise<[boolean, string[]]> {
    return this.enforcer.enforceEx(params);
  }

  /**
   * enforceExWithMatcher使用自定义匹配器，并通过返回匹配的规则来解释执行。
   * @param matcher要使用的matcher语句
   * @param params请求参数，通常为（sub、obj、act）
   * @return 请求是否被允许，以及是什么策略导致了这一决定
   */
  enforceExWithMatcher(matcher: string, ...params: string[]): Promise<[boolean, string[]]> {
    return this.enforcer.enforceExWithMatcher(matcher, params);
  }

  /**
   * batchEnforce强制执行每个请求，并在bool数组中返回结果
   * @param params请求参数，通常为（sub、obj、act）
   * @return 一个数组，其中包含每个给定请求的执行结果
   */
  batchEnforce(params: string[][]): Promise<boolean[]> {
    return this.enforcer.batchEnforce(params);
  }

  /**
   * 获取 model 中的字段索引.
   */
  getFieldIndex(ptype: string, field: string): number {
    return this.enforcer.getFieldIndex(ptype, field);
  }

  /**
   * 获取当前策略中显示的主题列表。
   *
   * @return all the subjects in "p" policy rules. It actually collects the
   *         0-index elements of "p" policy rules. So make sure your subject
   *         is the 0-index element, like (sub, obj, act). Duplicates are removed.
   */
  getAllSubjects(): Promise<string[]> {
    return this.enforcer.getAllSubjects();
  }

  /**
   * 获取显示在当前命名策略中的主题列表。
   *
   * @param ptype the policy type, can be "p", "p2", "p3", ..
   * @return all the subjects in policy rules of the ptype type. It actually
   *         collects the 0-index elements of the policy rules. So make sure
   *         your subject is the 0-index element, like (sub, obj, act).
   *         Duplicates are removed.
   */
  getAllNamedSubjects(ptype: string): Promise<string[]> {
    return this.enforcer.getAllNamedSubjects(ptype);
  }

  /**
   * 获取当前策略中显示的对象列表。
   *
   * @return all the objects in "p" policy rules. It actually collects the
   *         1-index elements of "p" policy rules. So make sure your object
   *         is the 1-index element, like (sub, obj, act).
   *         Duplicates are removed.
   */
  getAllObjects(): Promise<string[]> {
    return this.enforcer.getAllObjects();
  }

  /**
   * 获取显示在当前命名策略中的对象列表。
   *
   * @param ptype the policy type, can be "p", "p2", "p3", ..
   * @return all the objects in policy rules of the ptype type. It actually
   *         collects the 1-index elements of the policy rules. So make sure
   *         your object is the 1-index element, like (sub, obj, act).
   *         Duplicates are removed.
   */
  getAllNamedObjects(ptype: string): Promise<string[]> {
    return this.enforcer.getAllNamedObjects(ptype);
  }

  /**
   * 获取当前策略中显示的操作列表。
   *
   * @return all the actions in "p" policy rules. It actually collects
   *         the 2-index elements of "p" policy rules. So make sure your action
   *         is the 2-index element, like (sub, obj, act).
   *         Duplicates are removed.
   */
  getAllActions(): Promise<string[]> {
    return this.enforcer.getAllActions();
  }

  /**
   * 获取显示在当前命名策略中的操作列表。
   *
   * @param ptype the policy type, can be "p", "p2", "p3", ..
   * @return all the actions in policy rules of the ptype type. It actually
   *         collects the 2-index elements of the policy rules. So make sure
   *         your action is the 2-index element, like (sub, obj, act).
   *         Duplicates are removed.
   */
  getAllNamedActions(ptype: string): Promise<string[]> {
    return this.enforcer.getAllNamedActions(ptype);
  }

  /**
   * 获取当前策略中显示的角色列表。
   *
   * @return all the roles in "g" policy rules. It actually collects
   *         the 1-index elements of "g" policy rules. So make sure your
   *         role is the 1-index element, like (sub, role).
   *         Duplicates are removed.
   */
  getAllRoles(): Promise<string[]> {
    return this.enforcer.getAllRoles();
  }

  /**
   * 获取显示在当前命名策略中的角色列表。
   *
   * @param ptype the policy type, can be "g", "g2", "g3", ..
   * @return all the subjects in policy rules of the ptype type. It actually
   *         collects the 0-index elements of the policy rules. So make
   *         sure your subject is the 0-index element, like (sub, obj, act).
   *         Duplicates are removed.
   */
  getAllNamedRoles(ptype: string): Promise<string[]> {
    return this.enforcer.getAllNamedRoles(ptype);
  }

  /**
   * 获取策略中的所有授权规则。
   *
   * @return all the "p" policy rules.
   */
  getPolicy(): Promise<string[][]> {
    return this.enforcer.getPolicy();
  }

  /**
   * 获取策略中的所有授权规则，可以指定字段过滤器。
   *
   * @param fieldIndex the policy rule's start index to be matched.
   * @param fieldValues the field values to be matched, value ""
   *                    means not to match this field.
   * @return the filtered "p" policy rules.
   */
  getFilteredPolicy(fieldIndex: number, ...fieldValues: string[]): Promise<string[][]> {
    return this.enforcer.getFilteredPolicy(fieldIndex, ...fieldValues);
  }

  /**
   * 获取命名策略中的所有授权规则。
   *
   * @param ptype the policy type, can be "p", "p2", "p3", ..
   * @return the "p" policy rules of the specified ptype.
   */
  getNamedPolicy(ptype: string): Promise<string[][]> {
    return this.enforcer.getNamedPolicy(ptype);
  }

  /**
   * 获取命名策略中的所有授权规则，可以指定字段过滤器。
   *
   * @param ptype the policy type, can be "p", "p2", "p3", ..
   * @param fieldIndex the policy rule's start index to be matched.
   * @param fieldValues the field values to be matched, value ""
   *                    means not to match this field.
   * @return the filtered "p" policy rules of the specified ptype.
   */
  getFilteredNamedPolicy(ptype: string, fieldIndex: number, ...fieldValues: string[]): Promise<string[][]> {
    return this.enforcer.getFilteredNamedPolicy(ptype, fieldIndex, ...fieldValues);
  }

  /**
   * 获取策略中的所有角色继承规则。
   *
   * @return all the "g" policy rules.
   */
  getGroupingPolicy(): Promise<string[][]> {
    return this.enforcer.getGroupingPolicy();
  }

  /**
   * 获取策略中的所有角色继承规则，可以指定字段过滤器。
   *
   * @param fieldIndex the policy rule's start index to be matched.
   * @param fieldValues the field values to be matched, value "" means not to match this field.
   * @return the filtered "g" policy rules.
   */
  getFilteredGroupingPolicy(fieldIndex: number, ...fieldValues: string[]): Promise<string[][]> {
    return this.enforcer.getFilteredGroupingPolicy(fieldIndex, ...fieldValues);
  }

  /**
   * 获取策略中的所有角色继承规则。
   *
   * @param ptype the policy type, can be "g", "g2", "g3", ..
   * @return the "g" policy rules of the specified ptype.
   */
  getNamedGroupingPolicy(ptype: string): Promise<string[][]> {
    return this.enforcer.getNamedGroupingPolicy(ptype);
  }

  /**
   * 获取策略中的所有角色继承规则，可以指定字段过滤器。
   *
   * @param ptype the policy type, can be "g", "g2", "g3", ..
   * @param fieldIndex the policy rule's start index to be matched.
   * @param fieldValues the field values to be matched, value ""
   *                    means not to match this field.
   * @return the filtered "g" policy rules of the specified ptype.
   */
  getFilteredNamedGroupingPolicy(ptype: string, fieldIndex: number, ...fieldValues: string[]): Promise<string[][]> {
    return this.enforcer.getFilteredNamedGroupingPolicy(ptype, fieldIndex, ...fieldValues);
  }

  /**
   * 判断授权规则是否存在。
   *
   * @param params the "p" policy rule, ptype "p" is implicitly used.
   * @return whether the rule exists.
   */
  hasPolicy(...params: string[]): Promise<boolean> {
    return this.enforcer.hasPolicy(...params);
  }

  /**
   * 判断命名授权规则是否存在。
   *
   * @param ptype the policy type, can be "p", "p2", "p3", ..
   * @param params the "p" policy rule.
   * @return whether the rule exists.
   */
  hasNamedPolicy(ptype: string, ...params: string[]): Promise<boolean> {
    return this.enforcer.hasNamedPolicy(ptype, ...params);
  }

  /**
   * addPolicy 将授权规则添加到当前策略。
   * 如果规则已经存在，函数返回 false 并且不会添加规则。
   * 否则函数通过添加新规则返回 true。
   *
   * @param params the "p" policy rule, ptype "p" is implicitly used.
   * @return succeeds or not.
   */
  addPolicy(...params: string[]): Promise<boolean> {
    return this.enforcer.addPolicy(...params);
  }

  /**
   * 将授权规则添加到当前策略。
   * 如果规则已经存在，则函数返回 false 并且不会添加规则。
   * 否则函数通过添加新规则返回 true。
   *
   * @param rules the "p" policy rules, ptype "p" is implicitly used.
   * @return succeeds or not.
   */
  addPolicies(rules: string[][]): Promise<boolean> {
    return this.enforcer.addPolicies(rules);
  }

  /**
   * addNamedPolicy 将授权规则添加到当前命名策略。
   * 如果规则已经存在，函数返回 false 并且不会添加规则。
   * 否则函数通过添加新规则返回 true。
   *
   * @param ptype the policy type, can be "p", "p2", "p3", ..
   * @param params the "p" policy rule.
   * @return succeeds or not.
   */
  addNamedPolicy(ptype: string, ...params: string[]): Promise<boolean> {
    return this.enforcer.addNamedPolicy(ptype, ...params);
  }

  /**
   * 将授权规则添加到当前的命名策略。
   * 如果规则已经存在，则函数返回 false 并且不会添加规则。
   * 否则函数通过添加新规则返回 true。
   *
   * @param ptype the policy type, can be "p", "p2", "p3", ..
   * @param rules the "p" policy rules.
   * @return succeeds or not.
   */
  addNamedPolicies(ptype: string, rules: string[][]): Promise<boolean> {
    return this.enforcer.addNamedPolicies(ptype, rules);
  }

  /**
   * 从当前策略更新授权规则。
   * 如果规则不存在，函数返回 false。
   * 否则，该函数通过将其更改为新规则来返回 true。
   *
   * @return succeeds or not.
   * @param oldRule the policy will be remove
   * @param newRule the policy will be added
   */
  updatePolicy(oldRule: string[], newRule: string[]): Promise<boolean> {
    return this.enforcer.updatePolicy(oldRule, newRule);
  }

  /**
   * 从当前命名策略更新授权规则。
   * 如果规则不存在，函数返回 false。
   * 否则，该函数通过将其更改为新规则来返回 true。
   *
   * @param ptype the policy type, can be "p", "p2", "p3", ..
   * @param oldRule the policy rule will be remove
   * @param newRule the policy rule will be added
   * @return succeeds or not.
   */
  updateNamedPolicy(ptype: string, oldRule: string[], newRule: string[]): Promise<boolean> {
    return this.enforcer.updateNamedPolicy(ptype, oldRule, newRule);
  }

  /**
   * 从当前策略中删除授权规则。
   *
   * @param params the "p" policy rule, ptype "p" is implicitly used.
   * @return succeeds or not.
   */
  removePolicy(...params: string[]): Promise<boolean> {
    return this.enforcer.removePolicy(...params);
  }

  /**
   * 从当前策略中删除授权规则。
   *
   * @param rules the "p" policy rules, ptype "p" is implicitly used.
   * @return succeeds or not.
   */
  removePolicies(rules: string[][]): Promise<boolean> {
    return this.enforcer.removePolicies(rules);
  }

  /**
   * 从当前策略中删除授权规则，可以指定字段过滤器。
   *
   * @param fieldIndex the policy rule's start index to be matched.
   * @param fieldValues the field values to be matched, value ""
   *                    means not to match this field.
   * @return succeeds or not.
   */
  removeFilteredPolicy(fieldIndex: number, ...fieldValues: string[]): Promise<boolean> {
    return this.enforcer.removeFilteredPolicy(fieldIndex, ...fieldValues);
  }

  /**
   * 从当前命名策略中删除授权规则。
   *
   * @param ptype the policy type, can be "p", "p2", "p3", ..
   * @param params the "p" policy rule.
   * @return succeeds or not.
   */
  removeNamedPolicy(ptype: string, ...params: string[]): Promise<boolean> {
    return this.enforcer.removeNamedPolicy(ptype, ...params);
  }

  /**
   * 从当前命名策略中删除授权规则。
   *
   * @param ptype the policy type, can be "p", "p2", "p3", ..
   * @param rules the "p" policy rules.
   * @return succeeds or not.
   */
  removeNamedPolicies(ptype: string, rules: string[][]): Promise<boolean> {
    return this.enforcer.removeNamedPolicies(ptype, rules);
  }

  /**
   * 从当前命名策略中删除授权规则，可以指定字段过滤器。
   *
   * @param ptype the policy type, can be "p", "p2", "p3", ..
   * @param fieldIndex the policy rule's start index to be matched.
   * @param fieldValues the field values to be matched, value ""
   *                    means not to match this field.
   * @return succeeds or not.
   */
  removeFilteredNamedPolicy(ptype: string, fieldIndex: number, ...fieldValues: string[]): Promise<boolean> {
    return this.enforcer.removeFilteredNamedPolicy(ptype, fieldIndex, ...fieldValues);
  }

  /**
   * 判断角色继承规则是否存在。
   *
   * @param params the "g" policy rule, ptype "g" is implicitly used.
   * @return whether the rule exists.
   */
  hasGroupingPolicy(...params: string[]): Promise<boolean> {
    return this.enforcer.hasGroupingPolicy(...params);
  }

  /**
   * 确定命名角色继承规则是否存在。
   *
   * @param ptype the policy type, can be "g", "g2", "g3", ..
   * @param params the "g" policy rule.
   * @return whether the rule exists.
   */
  hasNamedGroupingPolicy(ptype: string, ...params: string[]): Promise<boolean> {
    return this.enforcer.hasNamedGroupingPolicy(ptype, ...params);
  }

  /**
   * 将角色继承规则添加到当前策略。
   * 如果规则已经存在，则函数返回 false 并且不会添加规则。
   * 否则，该函数通过添加新规则返回 true。
   *
   * @param params the "g" policy rule, ptype "g" is implicitly used.
   * @return succeeds or not.
   */
  addGroupingPolicy(...params: string[]): Promise<boolean> {
    return this.enforcer.addGroupingPolicy(...params);
  }

  /**
   * 向当前策略添加角色继承规则。
   * 如果规则已经存在，则函数返回 false 并且不会添加规则。
   * 否则函数通过添加新规则返回 true。
   *
   * @param rules the "g" policy rules, ptype "g" is implicitly used.
   * @return succeeds or not.
   */
  addGroupingPolicies(rules: string[][]): Promise<boolean> {
    return this.enforcer.addGroupingPolicies(rules);
  }

  /**
   * 将命名角色继承规则添加到当前策略。
   * 如果规则已经存在，函数返回 false 并且不会添加规则。
   * 否则函数通过添加新规则返回 true。
   *
   * @param ptype the policy type, can be "g", "g2", "g3", ..
   * @param params the "g" policy rule.
   * @return succeeds or not.
   */
  addNamedGroupingPolicy(ptype: string, ...params: string[]): Promise<boolean> {
    return this.enforcer.addNamedGroupingPolicy(ptype, ...params);
  }

  /**
   * 将命名角色继承规则添加到当前策略。
   * 如果规则已经存在，则函数返回 false 并且不会添加规则。
   * 否则函数通过添加新规则返回 true。
   *
   * @param ptype the policy type, can be "g", "g2", "g3", ..
   * @param rules the "g" policy rule.
   * @return succeeds or not.
   */
  addNamedGroupingPolicies(ptype: string, rules: string[][]): Promise<boolean> {
    return this.enforcer.addNamedGroupingPolicies(ptype, rules);
  }

  /**
   * 从当前策略中删除角色继承规则。
   *
   * @param params the "g" policy rule, ptype "g" is implicitly used.
   * @return succeeds or not.
   */
  removeGroupingPolicy(...params: string[]): Promise<boolean> {
    return this.enforcer.removeGroupingPolicy(...params);
  }

  /**
   * 从当前策略中删除角色继承规则。
   *
   * @param rules the "g" policy rules, ptype "g" is implicitly used.
   * @return succeeds or not.
   */
  removeGroupingPolicies(rules: string[][]): Promise<boolean> {
    return this.enforcer.removeGroupingPolicies(rules);
  }

  /**
   * 从当前策略中删除角色继承规则，可以指定字段过滤器。
   *
   * @param fieldIndex the policy rule's start index to be matched.
   * @param fieldValues the field values to be matched, value ""
   *                    means not to match this field.
   * @return succeeds or not.
   */
  removeFilteredGroupingPolicy(fieldIndex: number, ...fieldValues: string[]): Promise<boolean> {
    return this.enforcer.removeFilteredGroupingPolicy(fieldIndex, ...fieldValues);
  }

  /**
   * 从当前命名策略中删除角色继承规则。
   *
   * @param ptype the policy type, can be "g", "g2", "g3", ..
   * @param params the "g" policy rule.
   * @return succeeds or not.
   */
  removeNamedGroupingPolicy(ptype: string, ...params: string[]): Promise<boolean> {
    return this.enforcer.removeNamedGroupingPolicy(ptype, ...params);
  }

  /**
   * 从当前命名策略中删除角色继承规则。
   *
   * @param ptype the policy type, can be "g", "g2", "g3", ..
   * @param rules the "g" policy rules.
   * @return succeeds or not.
   */
  removeNamedGroupingPolicies(ptype: string, rules: string[][]): Promise<boolean> {
    return this.enforcer.removeNamedGroupingPolicies(ptype, rules);
  }

  /**
   * 从当前的命名策略中删除角色继承规则，可以指定字段过滤器。
   *
   * @param ptype the policy type, can be "g", "g2", "g3", ..
   * @param fieldIndex the policy rule's start index to be matched.
   * @param fieldValues the field values to be matched, value ""
   *                    means not to match this field.
   * @return succeeds or not.
   */
  removeFilteredNamedGroupingPolicy(ptype: string, fieldIndex: number, ...fieldValues: string[]): Promise<boolean> {
    return this.enforcer.removeFilteredNamedGroupingPolicy(ptype, fieldIndex, ...fieldValues);
  }

  /**
   * updateGroupingPolicy从当前策略更新角色继承规则。如果规则不存在，则函数返回false。否则，通过将其更改为新规则，函数将返回true。
   *
   * @param oldRule the old rule.
   * @param newRule the new rule.
   * @return succeeds or not.
   */
  updateGroupingPolicy(oldRule: string[], newRule: string[]): Promise<boolean> {
    return this.enforcer.updateGroupingPolicy(oldRule, newRule);
  }

  /**
   * updateNamedGroupingPolicy从当前策略更新命名角色继承规则。如果规则不存在，则函数返回false。否则，通过将其更改为新规则，函数将返回true。
   *
   * @param ptype the policy type, can be "g", "g2", "g3", ..
   * @param oldRule the old rule.
   * @param newRule the new rule.
   * @return succeeds or not.
   */
  updateNamedGroupingPolicy(ptype: string, oldRule: string[], newRule: string[]): Promise<boolean> {
    return this.enforcer.updateNamedGroupingPolicy(ptype, oldRule, newRule);
  }

  /**
   * 添加自定义函数。
   * @param name custom function name
   * @param func function
   */
  addFunction(name: string, func: MatchingFunction): Promise<void> {
    return this.enforcer.addFunction(name, func);
  }

  /**
   * 从文件/数据库重新加载策略
   */
  loadPolicy(): Promise<void> {
    return this.enforcer.loadPolicy();
  }

  selfAddPolicy(sec: string, ptype: string, rule: string[]): Promise<boolean> {
    return this.enforcer.selfAddPolicy(sec, ptype, rule);
  }

  selfRemovePolicy(sec: string, ptype: string, rule: string[]): Promise<boolean> {
    return this.enforcer.selfRemovePolicy(sec, ptype, rule);
  }

  selfRemoveFilteredPolicy(sec: string, ptype: string, fieldIndex: number, fieldValues: string[]): Promise<boolean> {
    return this.enforcer.selfRemoveFilteredPolicy(sec, ptype, fieldIndex, fieldValues);
  }

  selfUpdatePolicy(sec: string, ptype: string, oldRule: string[], newRule: string[]): Promise<boolean> {
    return this.enforcer.selfUpdatePolicy(sec, ptype, oldRule, newRule);
  }

  selfAddPolicies(sec: string, ptype: string, rule: string[][]): Promise<boolean> {
    return this.enforcer.selfAddPolicies(sec, ptype, rule);
  }

  selfRemovePolicies(sec: string, ptype: string, rule: string[][]): Promise<boolean> {
    return this.enforcer.selfRemovePolicies(sec, ptype, rule);
  }
}
