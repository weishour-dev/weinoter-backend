import { Inject, forwardRef } from '@nestjs/common';
import { DataSource, EntitySubscriberInterface, EventSubscriber, InsertEvent, RemoveEvent, UpdateEvent } from 'typeorm';
import { RbacService } from '@ws/common/services';
import { PermissionsService } from '@ws/app/systems/permissions/permissions.service';
import { MandateEntity } from './mandate.entity';
import { MandatesService } from './mandates.service';
import { isUndefined } from 'lodash';

@EventSubscriber()
export class RoleSubscriber implements EntitySubscriberInterface<MandateEntity> {
  constructor(
    dataSource: DataSource,
    private rbacService: RbacService,
    private mandatesService: MandatesService,
    @Inject(forwardRef(() => PermissionsService)) private permissionsService: PermissionsService,
  ) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return MandateEntity;
  }

  async afterInsert(event: InsertEvent<MandateEntity>) {
    const afterData = event.entity;

    // casbin - 分配权限
    const targetType = afterData.targetType;
    const targetId = afterData.targetId;
    const targetName = await this.mandatesService.getRbacSub(targetType, targetId);
    const afterObjs = await this.permissionsService.getRbacObjs(afterData.permissionIds);
    await this.rbacService.auth(targetType, targetName, [], afterObjs);
  }

  async afterUpdate(event: UpdateEvent<MandateEntity>) {
    const beforeData = event.databaseEntity;
    const afterData = event.entity;
    if (isUndefined(beforeData)) return;

    // casbin - 分配、撤销权限
    const targetType = afterData.targetType;
    const targetId = afterData.targetId;
    const targetName = await this.mandatesService.getRbacSub(targetType, targetId);
    const beforeObjs = await this.permissionsService.getRbacObjs(beforeData.permissionIds);
    const afterObjs = await this.permissionsService.getRbacObjs(afterData.permissionIds);
    await this.rbacService.auth(targetType, targetName, beforeObjs, afterObjs);
  }

  async afterRemove(event: RemoveEvent<MandateEntity>) {
    const beforeData = event.databaseEntity;

    // casbin - 撤销权限
    const targetType = beforeData.targetType;
    const targetId = beforeData.targetId;
    const targetName = await this.mandatesService.getRbacSub(targetType, targetId);
    const beforeObjs = await this.permissionsService.getRbacObjs(beforeData.permissionIds);
    await this.rbacService.auth(targetType, targetName, beforeObjs, []);
  }
}
