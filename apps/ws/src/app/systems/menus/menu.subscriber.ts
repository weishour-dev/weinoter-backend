import { HttpStatus, Inject, forwardRef } from '@nestjs/common';
import { DataSource, EntitySubscriberInterface, EventSubscriber, RemoveEvent } from 'typeorm';
import { ApiException } from '@weishour/core/exceptions';
import { MandatesService } from '@ws/app/systems/mandates/mandates.service';
import { PermissionsService } from '@ws/app/systems/permissions/permissions.service';
import { MenuEntity } from './menu.entity';

@EventSubscriber()
export class MenuSubscriber implements EntitySubscriberInterface<MenuEntity> {
  constructor(
    dataSource: DataSource,
    @Inject(forwardRef(() => MandatesService)) private mandatesService: MandatesService,
    @Inject(forwardRef(() => PermissionsService)) private permissionsService: PermissionsService,
  ) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return MenuEntity;
  }

  async beforeRemove(event: RemoveEvent<MenuEntity>) {
    const beforeData = event.databaseEntity;
    const isSystem = beforeData.isSystem;
    const menuId = beforeData.id;

    // 判断是否为系统内置数据
    if (isSystem) throw new ApiException(`系统内置数据禁止删除`, HttpStatus.NOT_IMPLEMENTED);

    // 判断菜单是否有对应的权限授权
    const permissions = await this.permissionsService.findBy({ menuId });
    for (const permission of permissions) {
      const mandates = await this.mandatesService.findByPermissionId(permission.id);
      if (mandates.length > 0) {
        throw new ApiException(`请先撤销该菜单的权限`, HttpStatus.NOT_IMPLEMENTED);
      }
    }
  }

  async afterRemove(event: RemoveEvent<MenuEntity>) {
    const beforeData = event.databaseEntity;
    const menuId = beforeData.id;

    // 删除菜单对应的权限
    await this.permissionsService.removeByMenuId(menuId);
  }
}
