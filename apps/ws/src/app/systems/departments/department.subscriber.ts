import { Inject, forwardRef } from '@nestjs/common';
import { DataSource, EntitySubscriberInterface, EventSubscriber, RemoveEvent, UpdateEvent } from 'typeorm';
import { MandateTargetType } from '@ws/common/constants';
import { RbacService } from '@ws/common/services';
import { MandatesService } from '@ws/app/systems/mandates/mandates.service';
import { DepartmentEntity } from './department.entity';

@EventSubscriber()
export class DepartmentSubscriber implements EntitySubscriberInterface<DepartmentEntity> {
  constructor(
    dataSource: DataSource,
    private rbacService: RbacService,
    @Inject(forwardRef(() => MandatesService)) private mandatesService: MandatesService,
  ) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return DepartmentEntity;
  }

  async afterUpdate(event: UpdateEvent<DepartmentEntity>) {
    // casbin - 更新部门
    await this.rbacService.departmentUpdate(event);
  }

  async afterRemove(event: RemoveEvent<DepartmentEntity>) {
    const beforeData = event.databaseEntity;

    // 删除对应授权记录
    await this.mandatesService.removeByTarget(MandateTargetType.DEPARTMENT, beforeData.id);

    // casbin - 删除部门
    await this.rbacService.departmentRemove(event);
  }
}
