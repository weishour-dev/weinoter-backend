import { HttpStatus, Inject, forwardRef } from '@nestjs/common';
import { DataSource, EntitySubscriberInterface, EventSubscriber, In, RemoveEvent, UpdateEvent } from 'typeorm';
import { ApiException } from '@weishour/core/exceptions';
import { RbacService } from '@ws/common/services';
import { DepartmentsService } from '@ws/app/systems/departments/departments.service';
import { UserEntity } from './user.entity';
import { isUndefined } from 'lodash';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<UserEntity> {
  constructor(
    dataSource: DataSource,
    private rbacService: RbacService,
    @Inject(forwardRef(() => DepartmentsService)) private departmentsService: DepartmentsService,
  ) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return UserEntity;
  }

  beforeUpdate(event: UpdateEvent<UserEntity>) {
    const beforeData = event.databaseEntity;
    const afterData = event.entity;

    if (beforeData?.username === 'admin') {
      afterData.username = 'admin';
    }
  }

  async afterUpdate(event: UpdateEvent<UserEntity>) {
    const beforeData = event.databaseEntity;
    const afterData = event.entity;
    if (isUndefined(beforeData)) return;

    // casbin - 更新用户
    await this.rbacService.userUpdate(event);

    // casbin - 为用户分配、撤销部门
    const beforeDIds = beforeData.departmentIds ?? [];
    const afterDIds = afterData.departmentIds ?? [];
    const beforeDs = await this.departmentsService.findBy({ id: In(beforeDIds) });
    const afterDs = await this.departmentsService.findBy({ id: In(afterDIds) });
    await this.rbacService.mandate('department', afterData.username, beforeDs, afterDs);
  }

  async beforeRemove(event: RemoveEvent<UserEntity>) {
    const beforeData = event.databaseEntity;
    const isSystem = beforeData.isSystem;

    // 判断是否为系统内置数据
    if (isSystem) throw new ApiException(`系统内置数据禁止删除`, HttpStatus.NOT_IMPLEMENTED);
  }

  async afterRemove(event: RemoveEvent<UserEntity>) {
    // casbin - 删除用户
    await this.rbacService.userRemove(event);
  }
}
