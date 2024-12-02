import { Reflector } from '@nestjs/core';
import { Injectable, CanActivate, ExecutionContext, Inject, HttpStatus } from '@nestjs/common';
import { WsConfigService } from '@weishour/core/services';
import { ApiException } from '@weishour/core/exceptions';
import { Enforcer } from 'casbin';
import { CASBIN_ENFORCER, PERMISSION } from './casbin.constants';
import { WsPermission } from './casbin.interface';

@Injectable()
export class CasbinGuard implements CanActivate {
  /** 用户前缀 */
  readonly userPrefix: string;
  /** 分隔符 */
  readonly separator: string;

  constructor(
    private reflector: Reflector,
    private wsConfigService: WsConfigService,
    @Inject(CASBIN_ENFORCER) private enforcer: Enforcer,
  ) {
    const rbacConfig = this.wsConfigService.get('rbac');
    this.userPrefix = rbacConfig.userPrefix;
    this.separator = rbacConfig.separator;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const handler = context.getHandler();
    const username = request.user?.username;
    const menuId = request.headers['ws-menu-id'] ?? 0;
    // 获取权限信息
    const permission = this.reflector.get<WsPermission>(PERMISSION, handler);

    // 只有系统管理员允许操作
    const adminAllow = permission?.adminAllow ?? false;
    if (adminAllow && username !== 'admin')
      throw new ApiException('只允许系统管理员进行操作', HttpStatus.NOT_IMPLEMENTED);

    const type = permission?.type ?? 'ACTION';
    const isMenu = type === 'MENU';
    // 菜单权限action指定为show
    const action = isMenu ? 'show' : permission?.action ?? handler.name;
    // 授权主体
    const sub = `${this.userPrefix}${this.separator}${username}`;
    // 授权操作
    const obj = `${menuId}:${type}:${action}`;
    // 检查是否拥有权限
    const isAllow = await this.enforcer.enforce(sub, obj, 'allow');

    if (!isAllow)
      throw new ApiException('未拥有该操作权限，操作失败', isMenu ? HttpStatus.FORBIDDEN : HttpStatus.NOT_IMPLEMENTED);

    return isAllow;
  }
}
