import { Inject, Injectable } from '@nestjs/common';
import { CASBIN_ENFORCER } from '@weishour/core/plugins/casbin';
import { WsConfigService, CasbinRbacService, CasbinManagementService } from '@weishour/core/services';
import { RemoveEvent, UpdateEvent } from 'typeorm';
import { Enforcer } from 'casbin';
import { UserEntity } from '@ws/app/systems/users/user.entity';
import { RoleEntity } from '@ws/app/systems/roles/role.entity';
import { UserGroupEntity } from '@ws/app/systems/user-groups/user-group.entity';
import { DepartmentEntity } from '@ws/app/systems/departments/department.entity';
import { PermissionEntity } from '@ws/app/systems/permissions/permission.entity';
import { cloneDeep, concat, difference, intersection, isUndefined } from 'lodash';

@Injectable()
export class RbacService extends CasbinRbacService {
  /** 用户前缀 */
  readonly userPrefix: string;
  /** 角色前缀 */
  readonly rolePrefix: string;
  /** 用户组前缀 */
  readonly groupPrefix: string;
  /** 部门前缀 */
  readonly departmentPrefix: string;
  /** 分隔符 */
  readonly separator: string;

  constructor(
    @Inject(CASBIN_ENFORCER) enforcer: Enforcer,
    private wsConfigService: WsConfigService,
    private casbinManagement: CasbinManagementService,
  ) {
    super(enforcer);

    const rbacConfig = this.wsConfigService.get('rbac');
    this.userPrefix = rbacConfig.userPrefix;
    this.rolePrefix = rbacConfig.rolePrefix;
    this.groupPrefix = rbacConfig.groupPrefix;
    this.departmentPrefix = rbacConfig.departmentPrefix;
    this.separator = rbacConfig.separator;
  }

  // ----------------------------------------------------------------------------
  // @ 查询
  // ----------------------------------------------------------------------------

  /**
   * 获取菜单权限
   * @param username
   * @returns
   */
  async getMenus(username: string): Promise<number[]> {
    username = `${this.userPrefix}${this.separator}${username}`;
    const menuIds: number[] = [];

    // 获取当前用户以及继承的所有权限
    const pindex = this.casbinManagement.getFieldIndex('p', 'obj');
    const permissions = await this.getImplicitResourcesForUser(username);
    for (const permission of permissions) {
      // 判断obj类型是菜单的权限
      const obj = permission[pindex].split(':');
      // 菜单权限action指定为show
      if (obj.length === 3 && obj[1] === 'MENU' && obj[2] === 'show') {
        // 判断当前用户是否拥有权限
        const status = await this.enforce(permission[0], permission[1], 'allow');
        const menuId = +obj[0];
        if (status && !menuIds.includes(menuId)) menuIds.push(menuId);
      }
    }

    return menuIds;
  }

  // ----------------------------------------------------------------------------
  // @ 权限
  // ----------------------------------------------------------------------------

  /**
   * 分配权限 (用户、角色、用户组、组织)
   * @param targetType
   * @param targetName
   * @param beforeObjs
   * @param afterObjs
   */
  async auth(targetType: string, targetName: string, beforeObjs: string[], afterObjs: string[]): Promise<void> {
    const sub = `${targetType}_${targetName}`;
    const delObjs = difference(beforeObjs, afterObjs);
    const addObjs = difference(afterObjs, beforeObjs);

    // 删除授权规则
    for (const delObj of delObjs) {
      await this.casbinManagement.removeNamedPolicy('p', sub, delObj, 'allow');
    }

    // 新增授权规则
    for (const addObj of addObjs) {
      await this.casbinManagement.addNamedPolicy('p', sub, addObj, 'allow');
    }
  }

  /**
   * 权限更新
   * @param event
   * @returns
   */
  async permissionUpdate(event: UpdateEvent<PermissionEntity>): Promise<void> {
    const beforeData = event.databaseEntity;
    const afterData = event.entity;
    if (isUndefined(beforeData)) return;

    const updatedColumns = event.updatedColumns;
    const updatedColumnNames = updatedColumns.map(column => column.propertyName);
    const beforeObj = `${beforeData.menuId}:${beforeData.type}:${beforeData.code}`;
    const afterObj = `${afterData.menuId}:${afterData.type}:${afterData.code}`;
    const pindex = this.casbinManagement.getFieldIndex('p', 'obj');

    // 权限状态更新
    if (updatedColumnNames.includes('status')) {
      const beforeAct = beforeData.status ? 'allow' : 'deny';
      const afterAct = afterData.status ? 'allow' : 'deny';
      const oldPDatas = await this.casbinManagement.getFilteredPolicy(pindex, beforeObj, beforeAct);
      for (const oldPData of oldPDatas) {
        const newPData = cloneDeep(oldPData);
        newPData[pindex + 1] = afterAct;

        // 更新权限规则
        await this.casbinManagement.updatePolicy(oldPData, newPData);
      }
    }

    // 权限类型|编号更新
    if (updatedColumnNames.includes('type') || updatedColumnNames.includes('code')) {
      const afterAct = afterData.status ? 'allow' : 'deny';
      const oldPDatas = await this.casbinManagement.getFilteredPolicy(pindex, beforeObj, afterAct);
      for (const oldPData of oldPDatas) {
        if (oldPData[pindex] !== afterObj) {
          const newPData = cloneDeep(oldPData);
          newPData[pindex] = afterObj;

          // 更新权限规则
          await this.casbinManagement.updatePolicy(oldPData, newPData);
        }
      }
    }
  }

  /**
   * 权限删除
   * @param event
   * @returns
   */
  async permissionRemove(event: RemoveEvent<PermissionEntity>): Promise<void> {
    const beforeData = event.databaseEntity;
    const pindex = this.casbinManagement.getFieldIndex('p', 'obj');
    const beforeObj = `${beforeData.menuId}:${beforeData.type}:${beforeData.code}`;
    const oldPDatas = await this.casbinManagement.getFilteredPolicy(pindex, beforeObj);

    for (const oldPData of oldPDatas) {
      await this.casbinManagement.removeFilteredNamedPolicy('p', pindex, oldPData[pindex]);
    }
  }

  // ----------------------------------------------------------------------------
  // @ 用户
  // ----------------------------------------------------------------------------

  /**
   * 用户更新
   * @param event
   * @returns
   */
  async userUpdate(event: UpdateEvent<UserEntity>): Promise<void> {
    const beforeData = event.databaseEntity;
    const afterData = event.entity;
    if (isUndefined(beforeData)) return;

    const updatedColumns = event.updatedColumns;
    const updatedColumnNames = updatedColumns.map(column => column.propertyName);

    // 判断是否为用户名修改
    if (!updatedColumnNames.includes('username')) return;

    const beforeUsername = `${this.userPrefix}${this.separator}${beforeData.username}`;
    const afterUsername = `${this.userPrefix}${this.separator}${afterData.username}`;
    const index = this.casbinManagement.getFieldIndex('p', 'sub');

    const oldPRules = await this.casbinManagement.getFilteredPolicy(index, beforeUsername);
    for (const oldPRule of oldPRules) {
      if (oldPRule[index] !== afterUsername) {
        const newPRule = cloneDeep(oldPRule);
        newPRule[index] = afterUsername;

        // casbin - 更新用户规则
        await this.casbinManagement.updatePolicy(oldPRule, newPRule);
      }
    }

    const oldGRules = await this.casbinManagement.getFilteredGroupingPolicy(index, beforeUsername);
    for (const oldGRule of oldGRules) {
      if (oldGRule[index] !== afterUsername) {
        const newGRule = cloneDeep(oldGRule);
        newGRule[index] = afterUsername;

        // casbin - 更新用户继承
        await this.casbinManagement.updateGroupingPolicy(oldGRule, newGRule);
      }
    }
  }

  /**
   * 用户删除
   * @param event
   * @returns
   */
  async userRemove(event: RemoveEvent<UserEntity>): Promise<void> {
    const username = `${this.userPrefix}${this.separator}${event.entity.username}`;

    // casbin - 删除用户
    await this.deleteUser(username);
  }

  /**
   * 为用户分配 (角色、用户组、组织)
   * @param targetType
   * @param userName
   * @param beforeDatas
   * @param afterDatas
   */
  async mandate<T>(targetType: string, username: string, beforeDatas: T[], afterDatas: T[]): Promise<void> {
    username = `${this.userPrefix}${this.separator}${username}`;
    const beforeCodes = beforeDatas.map(data => data['code']);
    const afterCodes = afterDatas.map(data => data['code']);
    const delCodes = difference(beforeCodes, afterCodes);
    const samCodes = intersection(afterCodes, beforeCodes);
    const addCodes = concat(samCodes, difference(afterCodes, beforeCodes));

    // 删除用户的角色继承
    for (const delCode of delCodes) {
      const targetName = `${targetType}${this.separator}${delCode}`;
      await this.casbinManagement.removeNamedGroupingPolicy('g', username, targetName);
    }

    // 新增用户的角色继承
    for (const addCode of addCodes) {
      const targetName = `${targetType}${this.separator}${addCode}`;
      await this.casbinManagement.addNamedGroupingPolicy('g', username, targetName);
    }
  }

  /**
   * 为用户撤销 (角色、用户组、组织)
   * @param targetType
   * @param username
   * @param targetName
   */
  async unMandate(targetType: string, username: string, targetName: string): Promise<void> {
    // 删除用户的角色继承
    username = `${this.userPrefix}${this.separator}${username}`;
    targetName = `${targetType}${this.separator}${targetName}`;
    await this.casbinManagement.removeNamedGroupingPolicy('g', username, targetName);
  }

  // ----------------------------------------------------------------------------
  // @ 角色
  // ----------------------------------------------------------------------------

  /**
   * 角色更新
   * @param event
   * @returns
   */
  async roleUpdate(event: UpdateEvent<RoleEntity>): Promise<void> {
    const beforeData = event.databaseEntity;
    const afterData = event.entity;
    if (isUndefined(beforeData)) return;

    const updatedColumns = event.updatedColumns;
    const updatedColumnNames = updatedColumns.map(column => column.propertyName);
    const beforeCode = `${this.rolePrefix}${this.separator}${beforeData.code}`;
    const afterCode = `${this.rolePrefix}${this.separator}${afterData.code}`;
    const pindex = this.casbinManagement.getFieldIndex('p', 'sub');

    // 状态修改
    if (updatedColumnNames.includes('status')) {
      const beforeAct = beforeData.status ? 'allow' : 'deny';
      const afterAct = afterData.status ? 'allow' : 'deny';
      const oldPDatas = await this.casbinManagement.getFilteredPolicy(pindex, beforeCode);
      for (const oldPData of oldPDatas) {
        if (oldPData[pindex + 2] === beforeAct) {
          const newPData = cloneDeep(oldPData);
          newPData[pindex + 2] = afterAct;

          // casbin - 更新角色规则
          await this.casbinManagement.updatePolicy(oldPData, newPData);
        }
      }
    }

    // 编号修改
    if (updatedColumnNames.includes('code')) {
      const oldPDatas = await this.casbinManagement.getFilteredPolicy(pindex, beforeCode);
      for (const oldPData of oldPDatas) {
        if (oldPData[pindex] !== afterCode) {
          const newPData = cloneDeep(oldPData);
          newPData[pindex] = afterCode;

          // casbin - 更新角色规则
          await this.casbinManagement.updatePolicy(oldPData, newPData);
        }
      }

      const gindex = this.casbinManagement.getFieldIndex('p', 'obj');
      const oldGDatas = await this.casbinManagement.getFilteredGroupingPolicy(gindex, beforeCode);
      for (const oldGData of oldGDatas) {
        if (oldGData[gindex] !== afterCode) {
          const newGData = cloneDeep(oldGData);
          newGData[gindex] = afterCode;

          // casbin - 更新角色继承
          await this.casbinManagement.updateGroupingPolicy(oldGData, newGData);
        }
      }
    }
  }

  /**
   * 角色删除
   * @param event
   * @returns
   */
  async roleRemove(event: RemoveEvent<RoleEntity>): Promise<void> {
    const dataCode = `${this.rolePrefix}${this.separator}${event.entity.code}`;

    // casbin - 删除角色权限
    await this.deleteRole(dataCode);
    // casbin - 删除继承的角色
    const objIndex = this.casbinManagement.getFieldIndex('p', 'obj');
    await this.casbinManagement.removeFilteredGroupingPolicy(objIndex, dataCode);
  }

  // ----------------------------------------------------------------------------
  // @ 用户组
  // ----------------------------------------------------------------------------

  /**
   * 用户组更新
   * @param event
   * @returns
   */
  async groupUpdate(event: UpdateEvent<UserGroupEntity>): Promise<void> {
    const beforeData = event.databaseEntity;
    const afterData = event.entity;
    if (isUndefined(event.databaseEntity)) return;

    const updatedColumns = event.updatedColumns;
    const updatedColumnNames = updatedColumns.map(column => column.propertyName);
    const beforeCode = `${this.groupPrefix}${this.separator}${beforeData.code}`;
    const afterCode = `${this.groupPrefix}${this.separator}${afterData.code}`;
    const pindex = this.casbinManagement.getFieldIndex('p', 'sub');

    // 状态修改
    if (updatedColumnNames.includes('status')) {
      const beforeAct = beforeData.status ? 'allow' : 'deny';
      const afterAct = afterData.status ? 'allow' : 'deny';
      const oldPDatas = await this.casbinManagement.getFilteredPolicy(pindex, beforeCode);
      for (const oldPData of oldPDatas) {
        if (oldPData[pindex + 2] === beforeAct) {
          const newPData = cloneDeep(oldPData);
          newPData[pindex + 2] = afterAct;

          // casbin - 更新用户组规则
          await this.casbinManagement.updatePolicy(oldPData, newPData);
        }
      }
    }

    // 编号修改
    if (updatedColumnNames.includes('code')) {
      const oldPDatas = await this.casbinManagement.getFilteredPolicy(pindex, beforeCode);
      for (const oldPData of oldPDatas) {
        if (oldPData[pindex] !== afterCode) {
          const newPData = cloneDeep(oldPData);
          newPData[pindex] = afterCode;

          // casbin - 更新用户组规则
          await this.casbinManagement.updatePolicy(oldPData, newPData);
        }
      }

      const gindex = this.casbinManagement.getFieldIndex('p', 'obj');
      const oldGDatas = await this.casbinManagement.getFilteredGroupingPolicy(gindex, beforeCode);
      for (const oldGData of oldGDatas) {
        if (oldGData[gindex] !== afterCode) {
          const newGData = cloneDeep(oldGData);
          newGData[gindex] = afterCode;

          // casbin - 更新用户组继承
          await this.casbinManagement.updateGroupingPolicy(oldGData, newGData);
        }
      }
    }
  }

  /**
   * 用户组删除
   * @param event
   * @returns
   */
  async groupRemove(event: RemoveEvent<UserGroupEntity>): Promise<void> {
    const dataCode = `${this.groupPrefix}${this.separator}${event.entity.code}`;

    // casbin - 删除用户组权限
    await this.deleteRole(dataCode);
    // casbin - 删除继承的用户组
    const objIndex = this.casbinManagement.getFieldIndex('p', 'obj');
    await this.casbinManagement.removeFilteredGroupingPolicy(objIndex, dataCode);
  }

  // ----------------------------------------------------------------------------
  // @ 部门
  // ----------------------------------------------------------------------------

  /**
   * 部门更新
   * @param event
   * @returns
   */
  async departmentUpdate(event: UpdateEvent<DepartmentEntity>): Promise<void> {
    const beforeData = event.databaseEntity;
    const afterData = event.entity;
    if (isUndefined(beforeData)) return;

    const updatedColumns = event.updatedColumns;
    const updatedColumnNames = updatedColumns.map(column => column.propertyName);
    const beforeCode = `${this.departmentPrefix}${this.separator}${beforeData.code}`;
    const afterCode = `${this.departmentPrefix}${this.separator}${afterData.code}`;
    const pindex = this.casbinManagement.getFieldIndex('p', 'sub');

    // 状态修改
    if (updatedColumnNames.includes('status')) {
      const beforeAct = beforeData.status ? 'allow' : 'deny';
      const afterAct = afterData.status ? 'allow' : 'deny';
      const oldPDatas = await this.casbinManagement.getFilteredPolicy(pindex, beforeCode);
      for (const oldPData of oldPDatas) {
        if (oldPData[pindex + 2] === beforeAct) {
          const newPData = cloneDeep(oldPData);
          newPData[pindex + 2] = afterAct;

          // casbin - 更新部门规则
          await this.casbinManagement.updatePolicy(oldPData, newPData);
        }
      }
    }

    // 编号修改
    if (updatedColumnNames.includes('code')) {
      const oldPDatas = await this.casbinManagement.getFilteredPolicy(pindex, beforeCode);
      for (const oldPData of oldPDatas) {
        if (oldPData[pindex] !== afterCode) {
          const newPData = cloneDeep(oldPData);
          newPData[pindex] = afterCode;

          // casbin - 更新部门规则
          await this.casbinManagement.updatePolicy(oldPData, newPData);
        }
      }

      const gindex = this.casbinManagement.getFieldIndex('p', 'obj');
      const oldGDatas = await this.casbinManagement.getFilteredGroupingPolicy(gindex, beforeCode);
      for (const oldGData of oldGDatas) {
        if (oldGData[gindex] !== afterCode) {
          const newGData = cloneDeep(oldGData);
          newGData[gindex] = afterCode;

          // casbin - 更新部门继承
          await this.casbinManagement.updateGroupingPolicy(oldGData, newGData);
        }
      }
    }
  }

  /**
   * 部门删除
   * @param event
   * @returns
   */
  async departmentRemove(event: RemoveEvent<DepartmentEntity>): Promise<void> {
    const dataCode = `${this.departmentPrefix}${this.separator}${event.entity.code}`;

    // casbin - 删除部门权限
    await this.deleteRole(dataCode);
    // casbin - 删除继承的部门
    const objIndex = this.casbinManagement.getFieldIndex('p', 'obj');
    await this.casbinManagement.removeFilteredGroupingPolicy(objIndex, dataCode);
  }
}
