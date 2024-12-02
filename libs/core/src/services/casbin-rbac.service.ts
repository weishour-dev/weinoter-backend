import { Injectable, Inject } from '@nestjs/common';
import { CASBIN_ENFORCER } from '@weishour/core/plugins/casbin';
import { Enforcer } from 'casbin';

/**
 * 一个更友好的RBAC API。 这个API是Management API的子集。 RBAC用户可以使用这个API来简化代码。
 */
@Injectable()
export class CasbinRbacService {
  constructor(@Inject(CASBIN_ENFORCER) public readonly enforcer: Enforcer) {}

  /**
   * enforce 决定一个“主体”是否可以访问一个“客体”操作“action”，输入参数通常是：(sub, obj, act)。
   *
   * @param rvals 请求需要被调解，通常是一个数组字符串，如果使用 ABAC，则可以是类实例。
   * @return 是否允许请求。
   */
  enforce(...rvals: any[]): Promise<boolean> {
    return this.enforcer.enforce(...rvals);
  }

  /**
   * enforce 决定一个“主体”是否可以访问一个“客体”操作“action”，输入参数通常为：(sub, obj, act)。
   *
   * @param rvals 请求需要调解，通常是一个数组字符串，如果使用 ABAC，则可以是类实例。
   * @return 是否允许请求和原因规则。
   */
  enforceEx(...rvals: any[]): Promise<[boolean, string[]]> {
    return this.enforcer.enforceEx(...rvals);
  }

  /**
   * batchEnforce 强制执行每个请求并返回 bool 数组中的结果。
   *
   * @param rvals 需要调解的请求，通常是一个数组字符串数组，如果使用 ABAC，则可以是类实例。
   * @returns 是否允许请求。
   */
  batchEnforce(rvals: any[]): Promise<boolean[]> {
    return this.enforcer.batchEnforce(rvals);
  }

  /**
   * 获取用户拥有的角色.
   *
   * @param name the user.
   * @param domain the domain.
   * @return the roles that the user has.
   */
  getRolesForUser(name: string, domain?: string): Promise<string[]> {
    return this.enforcer.getRolesForUser(name, domain);
  }

  /**
   * 获取具有角色的用户
   *
   * @param name the role.
   * @param domain the domain.
   * @return the users that has the role.
   */
  getUsersForRole(name: string, domain?: string): Promise<string[]> {
    return this.enforcer.getUsersForRole(name, domain);
  }

  /**
   * 确定用户是否具有角色.
   *
   * @param name the user.
   * @param role the role.
   * @param domain the domain.
   * @return whether the user has the role.
   */
  hasRoleForUser(name: string, role: string, domain?: string): Promise<boolean> {
    return this.enforcer.hasRoleForUser(name, role, domain);
  }

  /**
   * 为用户添加角色。
   * 如果用户已经拥有该角色（即不受影响），则返回 false。
   *
   * @param user the user.
   * @param role the role.
   * @param domain the domain.
   * @return succeeds or not.
   */
  addRoleForUser(user: string, role: string, domain?: string): Promise<boolean> {
    return this.enforcer.addRoleForUser(user, role, domain);
  }

  /**
   * 删除用户的角色。
   * 如果用户没有角色（又名不受影响），则返回 false。
   *
   * @param user the user.
   * @param role the role.
   * @param domain the domain.
   * @return succeeds or not.
   */
  deleteRoleForUser(user: string, role: string, domain?: string): Promise<boolean> {
    return this.enforcer.deleteRoleForUser(user, role, domain);
  }

  /**
   * 删除用户的所有角色。
   * 如果用户没有任何角色（即不受影响），则返回 false。
   *
   * @param user the user.
   * @param domain the domain.
   * @return succeeds or not.
   */
  deleteRolesForUser(user: string, domain?: string): Promise<boolean> {
    return this.enforcer.deleteRolesForUser(user, domain);
  }

  /**
   * 删除用户。
   * 如果用户不存在（又名不受影响），则返回 false。
   *
   * @param user the user.
   * @return succeeds or not.
   */
  deleteUser(user: string): Promise<boolean> {
    return this.enforcer.deleteUser(user);
  }

  /**
   * 删除一个角色。
   * 如果角色不存在（又名不受影响），则返回 false。
   *
   * @param role the role.
   * @return succeeds or not.
   */
  deleteRole(role: string): Promise<boolean> {
    return this.enforcer.deleteRole(role);
  }

  /**
   * 删除权限。
   * 如果权限不存在（即不受影响），则返回 false。
   *
   * @param permission the permission, usually be (obj, act). It is actually the rule without the subject.
   * @return succeeds or not.
   */
  deletePermission(...permission: string[]): Promise<boolean> {
    return this.enforcer.deletePermission(...permission);
  }

  /**
   * 为用户或角色添加权限。
   * 如果用户或角色已经拥有权限（也就是不受影响），则返回 false。
   *
   * @param user the user.
   * @param permission the permission, usually be (obj, act). It is actually the rule without the subject.
   * @return succeeds or not.
   */
  addPermissionForUser(user: string, ...permission: string[]): Promise<boolean> {
    return this.enforcer.addPermissionForUser(user, ...permission);
  }

  /**
   * 删除用户或角色的权限。
   * 如果用户或角色没有权限（也就是不受影响），则返回 false。
   *
   * @param user the user.
   * @param permission the permission, usually be (obj, act). It is actually the rule without the subject.
   * @return succeeds or not.
   */
  deletePermissionForUser(user: string, ...permission: string[]): Promise<boolean> {
    return this.enforcer.deletePermissionForUser(user, ...permission);
  }

  /**
   * 删除用户或角色的权限。
   * 如果用户或角色没有任何权限（即不受影响），则返回 false。
   *
   * @param user the user.
   * @return succeeds or not.
   */
  deletePermissionsForUser(user: string): Promise<boolean> {
    return this.enforcer.deletePermissionsForUser(user);
  }

  /**
   * 获取用户或角色的权限。
   *
   * @param user the user.
   * @return the permissions, a permission is usually like (obj, act). It is actually the rule without the subject.
   */
  getPermissionsForUser(user: string): Promise<string[][]> {
    return this.enforcer.getPermissionsForUser(user);
  }

  /**
   * 判断用户是否有权限。
   *
   * @param user the user.
   * @param permission the permission, usually be (obj, act). It is actually the rule without the subject.
   * @return whether the user has the permission.
   */
  hasPermissionForUser(user: string, ...permission: string[]): Promise<boolean> {
    return this.enforcer.hasPermissionForUser(user, ...permission);
  }

  /**
   * 获取用户拥有的隐式角色。
   * 与 getRolesForUser() 相比，此函数除了检索直接角色外还检索间接角色。
   * For example:
   * g, alice, role:admin
   * g, role:admin, role:user
   *
   * getRolesForUser("alice") can only get: ["role:admin"].
   * But getImplicitRolesForUser("alice") will get: ["role:admin", "role:user"].
   */
  getImplicitRolesForUser(name: string, ...domain: string[]): Promise<string[]> {
    return this.enforcer.getImplicitRolesForUser(name, ...domain);
  }

  /**
   * 获取用户或角色的隐式权限。
   * 与 getPermissionsForUser() 相比，此函数检索继承角色的权限。
   * For example:
   * p, admin, data1, read
   * p, alice, data2, read
   * g, alice, admin
   *
   * getPermissionsForUser("alice") can only get: [["alice", "data2", "read"]].
   * But getImplicitPermissionsForUser("alice") will get: [["admin", "data1", "read"], ["alice", "data2", "read"]].
   */
  getImplicitPermissionsForUser(user: string, ...domain: string[]): Promise<string[][]> {
    return this.enforcer.getImplicitPermissionsForUser(user, ...domain);
  }

  /**
   * 返回用户在域中获取的所有策略。
   */
  getImplicitResourcesForUser(user: string, ...domain: string[]): Promise<string[][]> {
    return this.enforcer.getImplicitResourcesForUser(user, ...domain);
  }

  /**
   * 获取角色拥有的隐式用户。
   * 与 getUsersForRole() 相比，此函数除了直接用户之外还检索间接用户。
   * For example:
   * g, alice, role:admin
   * g, role:admin, role:user
   *
   * getUsersForRole("user") can only get: ["role:admin"].
   * But getImplicitUsersForRole("user") will get: ["role:admin", "alice"].
   */
  getImplicitUsersForRole(role: string, ...domain: string[]): Promise<string[]> {
    return this.enforcer.getImplicitUsersForRole(role, ...domain);
  }

  /**
   * 获取用户在域中拥有的角色
   * 具有域参数的 getRolesForUser 的别名。
   *
   * @param name the user.
   * @param domain the domain.
   * @return the roles that the user has.
   */
  getRolesForUserInDomain(name: string, domain: string): Promise<string[]> {
    return this.enforcer.getRolesForUserInDomain(name, domain);
  }

  /**
   * 获取在域中具有角色的用户
   * 具有域参数的 getUsesForRole 的别名。
   *
   * @param name the role.
   * @param domain the domain.
   * @return the users that has the role.
   */
  getUsersForRoleInDomain(name: string, domain: string): Promise<string[]> {
    return this.enforcer.getUsersForRoleInDomain(name, domain);
  }

  /**
   * 获取权限的隐式用户。
   * For example:
   * p, admin, data1, read
   * p, bob, data1, read
   * g, alice, admin
   *
   * getImplicitUsersForPermission("data1", "read") will get: ["alice", "bob"].
   * Note: only users will be returned, roles (2nd arg in "g") will be excluded.
   */
  getImplicitUsersForPermission(...permission: string[]): Promise<string[]> {
    return this.enforcer.getImplicitUsersForPermission(...permission);
  }
}
