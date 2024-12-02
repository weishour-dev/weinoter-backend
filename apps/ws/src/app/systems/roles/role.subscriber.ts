import { Inject, forwardRef } from '@nestjs/common';
import { DataSource, EntitySubscriberInterface, EventSubscriber, RemoveEvent, UpdateEvent } from 'typeorm';
import { MandateTargetType } from '@ws/common/constants';
import { RbacService } from '@ws/common/services';
import { MandatesService } from '@ws/app/systems/mandates/mandates.service';
import { RoleEntity } from './role.entity';

@EventSubscriber()
export class RoleSubscriber implements EntitySubscriberInterface<RoleEntity> {
  constructor(
    dataSource: DataSource,
    private rbacService: RbacService,
    @Inject(forwardRef(() => MandatesService)) private mandatesService: MandatesService,
  ) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return RoleEntity;
  }

  async afterUpdate(event: UpdateEvent<RoleEntity>) {
    // casbin - 更新角色
    await this.rbacService.roleUpdate(event);
  }

  async afterRemove(event: RemoveEvent<RoleEntity>) {
    const beforeData = event.databaseEntity;

    // 删除对应授权记录
    await this.mandatesService.removeByTarget(MandateTargetType.ROLE, beforeData.id);

    // casbin - 删除角色
    await this.rbacService.roleRemove(event);
  }
}
