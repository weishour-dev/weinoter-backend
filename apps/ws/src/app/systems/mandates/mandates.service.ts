import { HttpStatus, Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ApiException } from '@weishour/core/exceptions';
import { Predicate, Result } from '@weishour/core/interfaces';
import { CommonUtil, success } from '@weishour/core/utils';
import { MandateTargetType, MandateTargets } from '@ws/common/constants';
import { ResourceItem } from '@ws/common/interfaces';
import { BaseService } from '@ws/common/services';
import { UsersService } from '@ws/app/systems/users/users.service';
import { RolesService } from '@ws/app/systems/roles/roles.service';
import { UserGroupsService } from '@ws/app/systems/user-groups/user-groups.service';
import { DepartmentsService } from '@ws/app/systems/departments/departments.service';
import { PermissionEntity } from '@ws/app/systems/permissions/permission.entity';
import { PermissionsService } from '@ws/app/systems/permissions/permissions.service';
import { AllotMandateDto, AddMandateGridDto, EditMandateGridDto, DeleteMandateGridDto } from './dtos';
import { MandateEntity } from './mandate.entity';
import { find, isUndefined, pull } from 'lodash';

@Injectable()
export class MandatesService extends BaseService<{
  M: MandateEntity;
  A: AddMandateGridDto;
  E: EditMandateGridDto;
  D: DeleteMandateGridDto;
}> {
  apiName = '授权';

  constructor(
    @InjectRepository(MandateEntity) private mandatesRepository: Repository<MandateEntity>,
    @Inject(forwardRef(() => PermissionsService)) private permissionsService: PermissionsService,
    @Inject(forwardRef(() => UsersService)) private usersService: UsersService,
    @Inject(forwardRef(() => RolesService)) private rolesService: RolesService,
    @Inject(forwardRef(() => UserGroupsService)) private userGroupsService: UserGroupsService,
    @Inject(forwardRef(() => DepartmentsService)) private departmentsService: DepartmentsService,
    commonUtil: CommonUtil,
  ) {
    super(mandatesRepository, commonUtil);
  }

  /**
   * 获取目标对象权限列表
   * @param allotMandateDto
   * @returns
   */
  async permissions({ targetType, targetId }: AllotMandateDto): Promise<Result> {
    const existing = await this.mandatesRepository.findOneBy({ targetType, targetId });
    let permissions: PermissionEntity[] = [];

    if (existing) {
      permissions = await this.permissionsService.findBy({ id: In(existing.permissionIds ?? []) });
    }

    return success('获取目标对象权限成功', permissions);
  }

  /**
   * 分配授权
   * @param allotMandateDto
   * @returns
   */
  async allot({ targetType, targetId, permissionIds, resources }: AllotMandateDto): Promise<Result> {
    const existing = await this.mandatesRepository.findOneBy({ targetType, targetId });

    if (existing) {
      existing.permissionIds = permissionIds;
      existing.resources = resources;

      if (resources.length === 0) {
        await this.mandatesRepository.remove(existing);
      } else {
        await this.mandatesRepository.save<MandateEntity>(existing);
      }
    } else {
      await this.mandatesRepository.save<MandateEntity>(
        this.mandatesRepository.create({ targetType, targetId, permissionIds, resources }),
      );
    }

    const targetName = find(MandateTargets, target => target.value === targetType)?.name;

    return success(`${targetName}分配授权成功`);
  }

  /**
   * 删除
   * @return {Promise<MandateEntity>} result
   */
  async removeByTarget(targetType: MandateTargetType, targetId: number): Promise<MandateEntity> {
    const existing = await this.mandatesRepository.findOneBy({ targetType, targetId });
    if (!existing) return;

    let mandate: MandateEntity;

    // 删除
    try {
      mandate = await this.mandatesRepository.remove(existing);
    } catch (error) {
      throw new ApiException('发生了一些错误', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (isUndefined(mandate.id)) {
      mandate.id = targetId;
      return mandate;
    }
  }

  // ----------------------------------------------------------------------------
  // @ 查询处理
  // ----------------------------------------------------------------------------

  /**
   * 获取rbac的sub
   * @param targetType
   * @param targetId
   * @returns
   */
  async getRbacSub(targetType: string, targetId: number): Promise<string> {
    let targetName = '';
    switch (targetType) {
      case MandateTargetType.USER:
        targetName = (await this.usersService.findOneBy({ id: targetId }))?.username;
        break;
      case MandateTargetType.ROLE:
        targetName = (await this.rolesService.findOneBy({ id: targetId }))?.code;
        break;
      case MandateTargetType.GROUP:
        targetName = (await this.userGroupsService.findOneBy({ id: targetId }))?.code;
        break;
      case MandateTargetType.DEPARTMENT:
        targetName = (await this.departmentsService.findOneBy({ id: targetId }))?.code;
        break;
    }

    return targetName;
  }

  /**
   * 获取目标对象权限列表
   * @param permissionId
   * @returns
   */
  async findByPermissionId(permissionId: number): Promise<MandateEntity[]> {
    let mandates: MandateEntity[] = [];
    let queryBuilder = this.createQueryBuilder('mandate');

    /** 复杂条件 */
    const where = [new Predicate('permissionIds_findinset', 'equal', permissionId)];
    queryBuilder = this.commonUtil.complexWhere<MandateEntity>(where, queryBuilder);

    mandates = await queryBuilder.getMany();

    return mandates;
  }

  /**
   * 类型调整处理
   * @param beforeType
   * @param afterType
   * @param permissionId
   * @returns
   */
  async typeChange(beforeType: string, afterType: string, permissionId: number): Promise<MandateEntity[]> {
    const mandates = await this.findByPermissionId(permissionId);

    for (const mandate of mandates) {
      // 调整权限类别
      const resources = mandate.resources.reduce((datas, item) => {
        const data = find(datas, { type: item.type });
        if (!data) {
          if (item.type === beforeType) {
            pull(item.actions, permissionId);
            if (item.actions.length > 0) datas.push(item);
          } else if (item.type === afterType) {
            item.actions.push(permissionId);
            datas.push(item);
          } else {
            datas.push(item);
          }
        }
        return datas;
      }, [] as ResourceItem[]);

      // 不存在则新增类别
      const afterTypeData = find(resources, resource => resource.type === afterType);
      if (isUndefined(afterTypeData)) resources.push({ type: afterType, actions: [permissionId] });

      mandate.resources = resources;
    }

    // 更新
    await this.mandatesRepository.save<MandateEntity>(mandates);

    return mandates;
  }

  /**
   * 权限删除
   * @param permissionId
   */
  async permissionRemove(permissionId: number): Promise<void> {
    const mandates = await this.findByPermissionId(permissionId);

    for (const mandate of mandates) {
      // 调整权限类别
      const resources = mandate.resources.reduce((datas, item) => {
        const data = find(datas, { type: item.type });
        if (!data) {
          const actions = pull(item.actions, permissionId);
          if (actions.length > 0) datas.push(item);
        }
        return datas;
      }, [] as ResourceItem[]);

      mandate.permissionIds = pull(
        mandate.permissionIds.map(id => +id),
        permissionId,
      );
      mandate.resources = resources;

      if (resources.length > 0) {
        // 更新
        await this.mandatesRepository.save<MandateEntity>(mandate, { listeners: false });
      } else {
        // 删除
        await this.mandatesRepository.remove(mandate, { listeners: false });
      }
    }
  }
}
