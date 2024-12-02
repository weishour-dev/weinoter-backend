import { Injectable, HttpStatus, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, TreeRepository } from 'typeorm';
import { ApiException } from '@weishour/core/exceptions';
import { UUID_NAMESPACE } from '@weishour/core/constants';
import { Result } from '@weishour/core/interfaces';
import { CommonUtil, success } from '@weishour/core/utils';
import { BaseService } from '@ws/common/services';
import { UsersService } from '@ws/app/systems/users/users.service';
import { GetParam } from '@ws/common/interfaces';
import { CommonSortDto } from '@ws/common/dtos';
import { AddDepartmentGridDto, EditDepartmentGridDto, DeleteDepartmentGridDto } from './dtos';
import { DepartmentEntity } from './department.entity';
import { indexOf, isUndefined, isNull, omit, isEmpty } from 'lodash';
import { v5 as uuidv5 } from 'uuid';

@Injectable()
export class DepartmentsService extends BaseService<{
  M: DepartmentEntity;
  A: AddDepartmentGridDto;
  E: EditDepartmentGridDto;
  D: DeleteDepartmentGridDto;
}> {
  apiName = '部门';

  constructor(
    @InjectRepository(DepartmentEntity)
    private departmentsRepository: TreeRepository<DepartmentEntity>,
    @Inject(forwardRef(() => UsersService)) private usersService: UsersService,
    commonUtil: CommonUtil,
  ) {
    super(departmentsRepository, commonUtil);
  }

  /**
   * 新增部门
   * @param {AddDepartmentGridDto} addDepartmentGridDto 部门信息
   * @return {Promise<Result>} result
   */
  async add(addDepartmentGridDto: AddDepartmentGridDto): Promise<Result> {
    let department: DepartmentEntity;

    try {
      // 编号处理
      if (isNull(addDepartmentGridDto.code) || isEmpty(addDepartmentGridDto.code))
        addDepartmentGridDto.code = uuidv5(addDepartmentGridDto.name, UUID_NAMESPACE);

      // 父级判断处理
      const parentId = addDepartmentGridDto.parentId;
      if (parentId) {
        const parent: DepartmentEntity = await this.departmentsRepository.findOneBy({
          id: parentId,
        });
        if (parent) {
          addDepartmentGridDto.parent = parent;
          addDepartmentGridDto.organizationCode = parent.code;
        }
      }

      department = await this.departmentsRepository.save<DepartmentEntity>(
        this.departmentsRepository.create(omit(addDepartmentGridDto, ['id'])),
      );

      // 获取部门所有父级信息
      const parents = await this.departmentsRepository.findAncestors(department);

      // 更新信息
      if (department) {
        if (parents.length > 0) {
          department.organizationCode = parents[0].organizationCode;
          department.level = parents.length;
        }

        const data = department;
        await this.departmentsRepository.save<DepartmentEntity>(this.departmentsRepository.merge(department, data));

        // 获取同级数量
        const parent = await this.departmentsRepository.findOneBy({ id: department.parentId });
        const siblingCount = await this.departmentsRepository.countDescendants(parent);
        department['siblingCount'] = siblingCount - 1;
      }
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') throw new ApiException('部门已存在', HttpStatus.CONFLICT);
      throw new ApiException('发生了一些错误', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return success('新增成功', department);
  }

  /**
   * 修改部门
   * @param {EditDepartmentGridDto} editDepartmentGridDto 部门信息
   * @return {Promise<Result>} result
   */
  async edit({ id, ...data }: EditDepartmentGridDto): Promise<Result> {
    let department: DepartmentEntity;
    const existing = await this.departmentsRepository.findOneBy({ id });
    if (!existing) throw new ApiException(`修改失败，ID 为 '${id}' 的部门不存在`, HttpStatus.NOT_FOUND);

    try {
      // 编号处理
      if (isEmpty(data.code) || (data.code !== uuidv5(data.name, UUID_NAMESPACE) && data.code.length === 36)) {
        data.code = uuidv5(data.name, UUID_NAMESPACE);
      }

      // 父级判断处理
      const parentId = data.parentId;
      if (parentId) {
        const parent: DepartmentEntity = await this.departmentsRepository.findOneBy({
          id: parentId,
        });
        if (parent) data.parent = parent;
      }

      // 获取同级数量
      const parent = await this.departmentsRepository.findOneBy({ id: existing.parentId });
      const siblingCount = await this.departmentsRepository.countDescendants(parent);

      // 获取上级所有父级信息
      const parents = await this.departmentsRepository.findAncestors(data.parent);
      if (parents.length > 0) {
        data['organizationCode'] = parents[0].organizationCode;
        data['level'] = parents.length + 1;
      }

      department = await this.departmentsRepository.save<DepartmentEntity>(
        this.departmentsRepository.merge(existing, data),
      );
      department['siblingCount'] = siblingCount - 1;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ApiException('部门编号或名称已存在', HttpStatus.CONFLICT);
      }
      throw new ApiException('发生了一些错误', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return success('修改部门成功', department);
  }

  /**
   * 删除部门
   * @param {DeleteDepartmentGridDto} deleteDepartmentGridDto 部门信息
   * @return {Promise<Result>} result
   */
  async remove({ id }: DeleteDepartmentGridDto): Promise<Result> {
    const existing = await this.departmentsRepository.findOneBy({ id });
    if (!existing) throw new ApiException(`删除失败，ID 为 '${id}' 的部门不存在`, HttpStatus.NOT_FOUND);

    // 删除部门
    const department = await this.departmentsRepository.remove(existing);

    // 获取同级数量
    const parent = await this.departmentsRepository.findOneBy({ id: existing.parentId });
    const siblingCount = await this.departmentsRepository.countDescendants(parent);
    department['siblingCount'] = siblingCount - 1;

    if (isUndefined(department.id)) {
      department.id = id;
      return success('删除部门成功', department);
    }
  }

  /**
   * 部门排序
   * @param {CommonSortDto} commonSortDto 排序信息
   * @return {Promise<Result>} result
   */
  async sort({ ids }: CommonSortDto): Promise<Result> {
    const departments = await this.departmentsRepository
      .createQueryBuilder('department')
      .orderBy('department.sort', 'ASC')
      .getMany();

    departments.forEach(async (department, index) => {
      // 查询现有的排序
      const existing = await this.departmentsRepository
        .createQueryBuilder('department')
        .select(['department.id', 'department.sort'])
        .where('department.id = :id', { id: ids[index] })
        .getOne();

      // 判断当前排序和现有排序
      if (department.sort !== existing.sort) {
        // 更新现有排序为当前排序
        await this.departmentsRepository.save<DepartmentEntity>(
          this.departmentsRepository.merge(existing, { sort: department.sort }),
        );
      }
    });

    return success('部门排序成功');
  }

  /**
   * 获取上级部门数据
   */
  async parent(): Promise<Result<DepartmentEntity[]>> {
    const departments = await this.departmentsRepository.createQueryBuilder('menu').getMany();

    // 额外处理
    for (const department of departments) {
      const departmentChildrens = await this.departmentsRepository.findDescendants(department);
      if (departmentChildrens.length >= 2) {
        department['expanded'] = true;
        department['hasChildren'] = true;
      }
    }

    if (departments) return success('获取上级部门数据成功', departments);
  }

  /**
   * 获取所有部门
   */
  async getAll(param: GetParam): Promise<Result<DepartmentEntity[]>> {
    const departments = await this.departmentsRepository.createQueryBuilder('department').getMany();

    // 额外处理
    for (const department of departments) {
      let index = 0;

      if (param.isSelected === 'true') {
        // 默认第一个一级为选中状态
        index = indexOf(departments, department);
        if (index === 0) department['selected'] = true;
      }

      const departmentChildrens = await this.departmentsRepository.findDescendants(department);
      if (departmentChildrens.length >= 2) {
        department['expanded'] = index === 0;
        department['hasChildren'] = true;
      }
    }

    if (departments) return success('获取所有部门数据成功', departments);
  }

  /**
   * 获取所有部门（树状）
   */
  async getAllTree(): Promise<Result<DepartmentEntity[]>> {
    const departments = await this.departmentsRepository.findTreesBy();

    if (departments) return success('获取树状部门数据成功', departments);
  }

  // ----------------------------------------------------------------------------
  // @ 其他处理
  // ----------------------------------------------------------------------------

  /**
   * 添加处理
   * @param {AddDepartmentGridDto} addDepartmentGridDto 部门信息
   * @return {Promise<DepartmentEntity>} DepartmentEntity
   */
  async addHandle(addDepartmentGridDto: AddDepartmentGridDto): Promise<DepartmentEntity> {
    let department: DepartmentEntity;

    try {
      if (isNull(addDepartmentGridDto.code) || isEmpty(addDepartmentGridDto.code))
        addDepartmentGridDto.code = uuidv5(addDepartmentGridDto.name, UUID_NAMESPACE);

      department = await this.departmentsRepository.save<DepartmentEntity>(
        this.departmentsRepository.create(omit(addDepartmentGridDto, ['id'])),
      );
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') throw new ApiException('部门编号或名称已存在', HttpStatus.CONFLICT);
      throw new ApiException('发生了一些错误', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return department;
  }

  /**
   * 修改处理
   * @param {EditDepartmentGridDto} editDto 部门信息
   * @return {Promise<DepartmentEntity>} DepartmentEntity
   */
  async editHandle({ id, ...editDto }: EditDepartmentGridDto): Promise<DepartmentEntity> {
    let department: DepartmentEntity;
    const existing = await this.departmentsRepository.findOneBy({ id });
    if (!existing) throw new ApiException(`修改失败，ID 为 '${id}' 的部门不存在`, HttpStatus.NOT_FOUND);

    try {
      // 编号处理
      if (
        isEmpty(editDto.code) ||
        (editDto.code !== uuidv5(editDto.name, UUID_NAMESPACE) && editDto.code.length === 36)
      ) {
        editDto.code = uuidv5(editDto.name, UUID_NAMESPACE);
      }

      department = await this.departmentsRepository.save<DepartmentEntity>(
        this.departmentsRepository.merge(existing, editDto),
      );
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') throw new ApiException('部门编号或名称已存在', HttpStatus.CONFLICT);
      throw new ApiException('发生了一些错误', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return department;
  }

  /**
   * 删除处理
   * @param {DeleteDepartmentGridDto} deleteDepartmentGridDto 部门信息
   * @return {Promise<DepartmentEntity>} DepartmentEntity
   */
  async removeHandle({ id }: DeleteDepartmentGridDto): Promise<DepartmentEntity> {
    const existing = await this.departmentsRepository.findOneBy({ id });
    if (!existing) throw new ApiException(`删除失败，ID 为 '${id}' 的部门不存在`, HttpStatus.NOT_FOUND);

    // 删除部门
    const department = await this.departmentsRepository.remove(existing);

    if (isUndefined(department.id)) {
      department.id = id;
      return department;
    }
  }

  /**
   * 部门人数处理
   * @param {number[]} departmentIds 部门ids
   */
  async membersCountHandle(departmentIds: number[]): Promise<DepartmentEntity[]> {
    const entities = await this.departmentsRepository.findBy({ id: In(departmentIds) });

    for (const existing of entities) {
      const users = await this.usersService.getListByDepartmentId(existing.id);
      existing.membersCount = users.length;
    }

    // 更新部门
    const departments = await this.departmentsRepository.save<DepartmentEntity>(entities);

    return departments;
  }
}
