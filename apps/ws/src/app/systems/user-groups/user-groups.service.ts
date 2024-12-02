import { HttpStatus, Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiException } from '@weishour/core/exceptions';
import { Result } from '@weishour/core/interfaces';
import { CommonUtil, success } from '@weishour/core/utils';
import { BaseService } from '@ws/common/services';
import { UsersService } from '@ws/app/systems/users/users.service';
import { AddGroupGridDto, EditGroupGridDto, DeleteGroupGridDto } from './dtos';
import { UserGroupEntity } from './user-group.entity';

@Injectable()
export class UserGroupsService extends BaseService<{
  M: UserGroupEntity;
  A: AddGroupGridDto;
  E: EditGroupGridDto;
  D: DeleteGroupGridDto;
}> {
  apiName = '用户组';

  constructor(
    @InjectRepository(UserGroupEntity) private groupsRepository: Repository<UserGroupEntity>,
    @Inject(forwardRef(() => UsersService)) private usersService: UsersService,
    commonUtil: CommonUtil,
  ) {
    super(groupsRepository, commonUtil);
  }

  // ----------------------------------------------------------------------------
  // @ 用户
  // ----------------------------------------------------------------------------

  /**
   * 获取用户
   * @param userGroupId
   * @returns
   */
  async getUsers(userGroupId: number): Promise<Result> {
    const existing = await this.groupsRepository.findOne({
      where: { id: userGroupId },
      relations: ['users'],
    });

    if (!existing) throw new ApiException(`获取用户失败，ID 为 '${userGroupId}' 的用户组不存在`, HttpStatus.NOT_FOUND);

    const users = await this.usersService.getByIds(existing.users.map(user => user.id));

    return success(`获取用户组为 '${existing.name}' 的用户成功`, users);
  }
}
