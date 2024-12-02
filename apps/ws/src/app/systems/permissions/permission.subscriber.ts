import { Inject, forwardRef } from '@nestjs/common';
import { DataSource, EntitySubscriberInterface, EventSubscriber, RemoveEvent, UpdateEvent } from 'typeorm';
import { RbacService } from '@ws/common/services';
import { MandatesService } from '@ws/app/systems/mandates/mandates.service';
import { PermissionEntity } from './permission.entity';
import { isUndefined } from 'lodash';

@EventSubscriber()
export class PermissionSubscriber implements EntitySubscriberInterface<PermissionEntity> {
  constructor(
    dataSource: DataSource,
    private rbacService: RbacService,
    @Inject(forwardRef(() => MandatesService)) private mandatesService: MandatesService,
  ) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return PermissionEntity;
  }

  async afterUpdate(event: UpdateEvent<PermissionEntity>) {
    const beforeData = event.databaseEntity;
    const afterData = event.entity;
    if (isUndefined(beforeData)) return;

    const updatedColumns = event.updatedColumns;
    const updatedColumnNames = updatedColumns.map(column => column.propertyName);

    // 权限类型更新
    if (updatedColumnNames.includes('type')) {
      // 授权记录的权限类别修改处理
      await this.mandatesService.typeChange(beforeData.type, afterData.type, beforeData.id);
    }

    // casbin - 更新权限
    this.rbacService.permissionUpdate(event);
  }

  async afterRemove(event: RemoveEvent<PermissionEntity>) {
    const beforeData = event.databaseEntity;

    // 授权记录的权限删除处理
    await this.mandatesService.permissionRemove(beforeData.id);

    // casbin - 删除权限
    this.rbacService.permissionRemove(event);
  }
}
