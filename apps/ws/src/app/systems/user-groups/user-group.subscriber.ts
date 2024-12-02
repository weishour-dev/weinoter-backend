import { Inject, forwardRef } from '@nestjs/common';
import { DataSource, EntitySubscriberInterface, EventSubscriber, RemoveEvent, UpdateEvent } from 'typeorm';
import { MandateTargetType } from '@ws/common/constants';
import { RbacService } from '@ws/common/services';
import { MandatesService } from '@ws/app/systems/mandates/mandates.service';
import { UserGroupEntity } from './user-group.entity';

@EventSubscriber()
export class UserGroupSubscriber implements EntitySubscriberInterface<UserGroupEntity> {
  constructor(
    dataSource: DataSource,
    private rbacService: RbacService,
    @Inject(forwardRef(() => MandatesService)) private mandatesService: MandatesService,
  ) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return UserGroupEntity;
  }

  async afterUpdate(event: UpdateEvent<UserGroupEntity>) {
    // casbin - 更新用户组
    await this.rbacService.groupUpdate(event);
  }

  async afterRemove(event: RemoveEvent<UserGroupEntity>) {
    const beforeData = event.databaseEntity;

    // 删除对应授权记录
    await this.mandatesService.removeByTarget(MandateTargetType.GROUP, beforeData.id);

    // casbin - 删除用户组
    await this.rbacService.groupRemove(event);
  }
}
