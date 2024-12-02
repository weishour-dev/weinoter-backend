import { Injectable, HttpStatus, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiException } from '@weishour/core/exceptions';
import { UUID_NAMESPACE } from '@weishour/core/constants';
import { QueryRunnerFactory } from '@weishour/core/factories';
import { Result } from '@weishour/core/interfaces';
import { CommonUtil, success } from '@weishour/core/utils';
import { BaseService } from '@ws/common/services';
import { DepartmentsService } from '@ws/app/systems/departments/departments.service';
import { DepartmentEntity } from '@ws/app/systems/departments/department.entity';
import { AddOrganizationGridDto, EditOrganizationGridDto, DeleteOrganizationGridDto } from './dtos';
import { OrganizationEntity } from './organization.entity';
import { isEmpty, isNull, omit } from 'lodash';
import { v5 as uuidv5 } from 'uuid';

@Injectable()
export class OrganizationsService extends BaseService<{
  M: OrganizationEntity;
  A: AddOrganizationGridDto;
  E: EditOrganizationGridDto;
  D: DeleteOrganizationGridDto;
}> {
  apiName = '组织';

  constructor(
    private queryRunnerFactory: QueryRunnerFactory,
    @InjectRepository(OrganizationEntity)
    private organizationsRepository: Repository<OrganizationEntity>,
    @Inject(forwardRef(() => DepartmentsService)) private departmentsService: DepartmentsService,
    commonUtil: CommonUtil,
  ) {
    super(organizationsRepository, commonUtil);
  }

  /**
   * 创建组织
   * @param {AddOrganizationGridDto} addOrganizationGridDto 组织信息
   * @return {Promise<Result>} result
   */
  async add(addOrganizationGridDto: AddOrganizationGridDto): Promise<Result> {
    const queryRunner = await this.queryRunnerFactory.createQueryRunner();

    let organization: OrganizationEntity;
    let department: DepartmentEntity;

    try {
      // 编号处理
      if (isNull(addOrganizationGridDto.code) || isEmpty(addOrganizationGridDto.code))
        addOrganizationGridDto.code = uuidv5(addOrganizationGridDto.name, UUID_NAMESPACE);

      await queryRunner.start();

      organization = await queryRunner.manager.save<OrganizationEntity>(
        this.organizationsRepository.create(omit(addOrganizationGridDto, ['id'])),
      );

      // 添加对应部门
      department = await this.departmentsService.addHandle({
        organizationCode: organization.code,
        code: organization.code,
        name: organization.name,
        description: organization.description,
        status: organization.status,
      });

      // 更新信息
      if (department) {
        organization.departmentId = department.id;
        const data = organization;
        organization = await queryRunner.manager.save<OrganizationEntity>(
          this.organizationsRepository.merge(organization, data),
        );
      }

      await queryRunner.commit();
    } catch (error) {
      await queryRunner.rollback();

      if (error instanceof ApiException) throw new ApiException(error['response'], HttpStatus.INTERNAL_SERVER_ERROR);

      if (error.code === 'ER_DUP_ENTRY') throw new ApiException('组织编号或名称已存在', HttpStatus.CONFLICT);
      throw new ApiException('发生了一些错误', HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      await queryRunner.release();
    }

    return success('新增组织成功', department);
  }

  /**
   * 修改组织
   * @param {EditOrganizationGridDto} editDto 组织信息
   * @return {Promise<Result>} result
   */
  async edit({ id, ...editDto }: EditOrganizationGridDto): Promise<Result> {
    const queryRunner = await this.queryRunnerFactory.createQueryRunner();

    let organization: OrganizationEntity;
    let department: DepartmentEntity;

    department = await this.departmentsService.findOneBy({ id });
    const code = department.organizationCode;
    const existing = await this.organizationsRepository.findOneBy({ code });
    if (!existing) throw new ApiException(`修改失败，ID 为 '${id}' 的组织不存在`, HttpStatus.NOT_FOUND);

    try {
      // 编号处理
      if (
        isEmpty(editDto.code) ||
        (editDto.code !== uuidv5(editDto.name, UUID_NAMESPACE) && editDto.code.length === 36)
      ) {
        editDto.code = uuidv5(editDto.name, UUID_NAMESPACE);
      }

      await queryRunner.start();

      organization = await queryRunner.manager.save<OrganizationEntity>(
        this.organizationsRepository.merge(existing, editDto),
      );

      // 修改对应部门
      department = await this.departmentsService.editHandle({
        id,
        organizationCode: organization.code,
        code: organization.code,
        name: organization.name,
        description: organization.description,
        status: organization.status,
      });

      await queryRunner.commit();
    } catch (error) {
      await queryRunner.rollback();

      if (error.code === 'ER_DUP_ENTRY') throw new ApiException('组织编号或名称已存在', HttpStatus.CONFLICT);
      throw new ApiException('发生了一些错误', HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      await queryRunner.release();
    }

    return success('修改组织成功', department);
  }

  /**
   * 删除组织
   * @param {DeleteOrganizationGridDto} deleteOrganizationGridDto 组织信息
   * @return {Promise<Result>} result
   */
  async remove({ userId, id }: DeleteOrganizationGridDto): Promise<Result> {
    const queryRunner = await this.queryRunnerFactory.createQueryRunner();

    let department: DepartmentEntity;

    department = await this.departmentsService.findOneBy({ id });
    const code = department.organizationCode;
    const existing = await this.organizationsRepository.findOneBy({ code });

    if (!existing) throw new ApiException(`删除失败，ID 为 '${id}' 的部门不存在`, HttpStatus.NOT_FOUND);

    try {
      await queryRunner.start();

      // 删除组织
      await this.organizationsRepository.remove(existing);

      // 删除对应部门
      department = await this.departmentsService.removeHandle({ userId, id });

      await queryRunner.commit();
    } catch (error) {
      await queryRunner.rollback();
      throw new ApiException('发生了一些错误', HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      await queryRunner.release();
    }

    return success('删除部门成功', department);
  }
}
