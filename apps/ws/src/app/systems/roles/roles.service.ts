import { Injectable, HttpStatus, forwardRef, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiException } from '@weishour/core/exceptions';
import { Result } from '@weishour/core/interfaces';
import { CommonUtil, success } from '@weishour/core/utils';
import { BaseService } from '@ws/common/services';
import { UsersService } from '@ws/app/systems/users/users.service';
import { AddRoleGridDto, EditRoleGridDto, DeleteRoleGridDto } from './dtos';
import { RoleEntity } from './role.entity';

@Injectable()
export class RolesService extends BaseService<{
  M: RoleEntity;
  A: AddRoleGridDto;
  E: EditRoleGridDto;
  D: DeleteRoleGridDto;
}> {
  apiName = '角色';

  constructor(
    @InjectRepository(RoleEntity) private rolesRepository: Repository<RoleEntity>,
    @Inject(forwardRef(() => UsersService)) private usersService: UsersService,
    commonUtil: CommonUtil,
  ) {
    super(rolesRepository, commonUtil);
  }

  // ----------------------------------------------------------------------------
  // @ 用户
  // ----------------------------------------------------------------------------

  /**
   * 获取用户
   * @param roleId
   * @returns
   */
  async getUsers(roleId: number): Promise<Result> {
    const existing = await this.rolesRepository.findOne({
      where: { id: roleId },
      relations: ['users'],
    });

    if (!existing) throw new ApiException(`获取用户失败，ID 为 '${roleId}' 的角色不存在`, HttpStatus.NOT_FOUND);

    const users = await this.usersService.getByIds(existing.users.map(user => user.id));

    return success(`获取角色为 '${existing.name}' 的用户成功`, users);
  }
}
