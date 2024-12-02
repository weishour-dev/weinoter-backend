import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CommonUtil } from '@weishour/core/utils';
import { BaseService } from '@ws/common/services';
import { ApiException } from '@weishour/core/exceptions';
import { AddPermissionGridDto, EditPermissionGridDto, DeletePermissionGridDto } from './dtos';
import { PermissionEntity } from './permission.entity';

@Injectable()
export class PermissionsService extends BaseService<{
  M: PermissionEntity;
  A: AddPermissionGridDto;
  E: EditPermissionGridDto;
  D: DeletePermissionGridDto;
}> {
  apiName = '权限';

  constructor(
    @InjectRepository(PermissionEntity) private permissionsRepository: Repository<PermissionEntity>,
    commonUtil: CommonUtil,
  ) {
    super(permissionsRepository, commonUtil);
  }

  // ----------------------------------------------------------------------------
  // @ 查询处理
  // ----------------------------------------------------------------------------

  /**
   * 获取rbac的objs
   * @returns
   */
  async getRbacObjs(permissionIds: number[]): Promise<string[]> {
    // 获取当前授权的所有权限节点信息
    const permissions = await this.findBy({ id: In(permissionIds ?? []) });
    const objs = permissions.map(permission => `${permission.menuId}:${permission.type}:${permission.code}`);

    return objs;
  }

  /**
   * 通过菜单id删除
   * @returns
   */
  async removeByMenuId(menuId: number): Promise<PermissionEntity[]> {
    // 获取菜单的所有权限节点信息
    let permissions = await this.findBy({ menuId });
    try {
      permissions = await this.permissionsRepository.remove(permissions);
    } catch (error) {
      throw new ApiException('发生了一些错误', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return permissions;
  }
}
