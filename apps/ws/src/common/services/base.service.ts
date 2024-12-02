import { Injectable, HttpStatus } from '@nestjs/common';
import { Repository, In, FindOptionsWhere, DeepPartial, QueryRunner, SelectQueryBuilder } from 'typeorm';
import { ApiException } from '@weishour/core/exceptions';
import { DataStateArgs, Result } from '@weishour/core/interfaces';
import { CommonUtil, success } from '@weishour/core/utils';
import { CommonSortDto, CommonShowHiddenDto, CommonEnableDisableDto } from '@ws/common/dtos';
import { isUndefined, omit, map } from 'lodash';
export type ObjectLiteral = DeepPartial<{ [key: string]: any }>;
export type SafeAny = any;

@Injectable()
export class BaseService<
  paramType extends {
    M: ObjectLiteral;
    A?: SafeAny;
    E?: SafeAny;
    D?: SafeAny;
  } = {
    M: ObjectLiteral;
    A: SafeAny;
    E: SafeAny;
    D: SafeAny;
  },
  varType extends {
    FW: FindOptionsWhere<paramType['M']>;
  } = {
    FW: FindOptionsWhere<paramType['M']>;
  },
> {
  readonly apiName: string;

  constructor(
    private repository: Repository<paramType['M']>,
    public commonUtil: CommonUtil,
  ) {}

  /**
   * 获取所有数据（表格）
   * @param userId
   * @param dataStateArgs
   * @returns Promise<Result<paramType['M'][]>>
   */
  async getGrid(userId = 0, dataStateArgs: DataStateArgs): Promise<Result<paramType['M'][]>> {
    const where = dataStateArgs?.where;
    const sorted = dataStateArgs?.sorted;

    let queryBuilder = this.repository.createQueryBuilder('alias');

    /** 复杂条件 */
    queryBuilder = this.commonUtil.complexWhere<paramType['M']>(where, queryBuilder);

    /** 组合排序 */
    if (isUndefined(sorted)) {
      queryBuilder.orderBy('alias.sort', 'ASC');
    } else {
      sorted.forEach(sort => queryBuilder.addOrderBy(sort.name, sort.direction));
    }

    const mdatas = await queryBuilder.getMany();

    if (mdatas) return success(`获取所有${this.apiName}成功`, mdatas);
  }

  /**
   * 新增（表格）
   * @param {paramType['A']} param
   * @return {Promise<Result>} result
   */
  async addGrid(param: paramType['A']): Promise<Result> {
    let mdata: paramType['M'];

    try {
      mdata = await this.repository.save<paramType['M']>(this.repository.create(omit(param, ['id'])));
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') throw new ApiException(`${this.apiName}编号或名称已存在`, HttpStatus.CONFLICT);
      throw new ApiException('发生了一些错误', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return success(`新增${this.apiName}成功`, mdata);
  }

  /**
   * 修改（表格）
   * @param {paramType['E']} param 修改信息
   * @return {Promise<Result>} result
   */
  async editGrid({ id, ...data }: paramType['E']): Promise<Result> {
    let mdata: paramType['M'];
    const existing = await this.repository.findOneBy({ id });
    if (!existing) throw new ApiException(`修改失败，ID 为 '${id}' 的权限不存在`, HttpStatus.NOT_FOUND);

    try {
      mdata = await this.repository.save<paramType['M']>(this.repository.merge(existing, data));
    } catch (error) {
      // console.log(error);
      if (error.code === 'ER_DUP_ENTRY') throw new ApiException(`${this.apiName}编号或名称已存在`, HttpStatus.CONFLICT);
      throw new ApiException('发生了一些错误', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return success(`修改${this.apiName}成功`, mdata);
  }

  /**
   * 删除（表格）
   * @param {paramType['D']} param 删除信息
   * @return {Promise<Result>} result
   */
  async removeGrid({ key }: paramType['D']): Promise<Result> {
    const existing = await this.repository.findOneBy({ id: key });
    if (!existing) throw new ApiException(`删除失败，ID 为 '${key}' 的${this.apiName}不存在`, HttpStatus.NOT_FOUND);

    let mdata: paramType['M'];

    // 删除
    try {
      mdata = await this.repository.remove(existing);
    } catch (error) {
      if (error instanceof ApiException) throw new ApiException(error['response'], HttpStatus.INTERNAL_SERVER_ERROR);

      throw new ApiException('发生了一些错误', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (isUndefined(mdata.id)) {
      mdata.id = key;
      return success(`删除${this.apiName}成功`, mdata);
    }
  }

  /**
   * 批量删除（表格）
   * @param {paramType['M'][]} params 批量删除信息
   * @return {Promise<Result>} result
   */
  async batchRemoveGrid(params: paramType['M'][]): Promise<Result> {
    const entities = await this.repository.findBy({
      id: In(map(params, 'id')),
    } as unknown as varType['FW']);

    if (entities.length == 0) throw new ApiException(`删除失败，删除的${this.apiName}不存在`, HttpStatus.NOT_FOUND);

    let mdatas: paramType['M'][];

    // 删除
    try {
      mdatas = await this.repository.remove(entities);
    } catch (error) {
      if (error instanceof ApiException) throw new ApiException(error['response'], HttpStatus.INTERNAL_SERVER_ERROR);

      throw new ApiException('发生了一些错误', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (mdatas.length > 0) {
      return success(`批量删除${this.apiName}成功`, mdatas);
    }
  }

  /**
   * 新增
   * @param {paramType['A']} param
   * @return {Promise<Result>} result
   */
  async add(param: paramType['A']): Promise<Result> {
    let mdata: paramType['M'];

    try {
      mdata = await this.repository.save<paramType['M']>(this.repository.create(omit(param, ['id'])));
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') throw new ApiException(`${this.apiName}编号或名称已存在`, HttpStatus.CONFLICT);
      throw new ApiException('发生了一些错误', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return success(`新增${this.apiName}成功`, mdata);
  }

  /**
   * 修改
   * @param {paramType['E']} param 修改信息
   * @return {Promise<Result>} result
   */
  async edit({ id, ...data }: paramType['E']): Promise<Result> {
    let mdata: paramType['M'];
    const existing = await this.repository.findOneBy({ id });
    if (!existing) throw new ApiException(`修改失败，ID 为 '${id}' 的权限不存在`, HttpStatus.NOT_FOUND);

    try {
      mdata = await this.repository.save<paramType['M']>(this.repository.merge(existing, data));
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') throw new ApiException(`${this.apiName}编号或名称已存在`, HttpStatus.CONFLICT);
      throw new ApiException('发生了一些错误', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return success(`修改${this.apiName}成功`, mdata);
  }

  /**
   * 删除
   * @param {paramType['D']} param 删除信息
   * @return {Promise<Result>} result
   */
  async remove({ id, ids }: paramType['D']): Promise<Result> {
    if (id) {
      const existing = await this.repository.findOneBy({ id });
      if (!existing) throw new ApiException(`删除失败，ID 为 '${id}' 的${this.apiName}不存在`, HttpStatus.NOT_FOUND);

      let mdata: paramType['M'];

      // 删除
      try {
        mdata = await this.repository.remove(existing);
      } catch (error) {
        if (error instanceof ApiException) throw new ApiException(error['response'], HttpStatus.INTERNAL_SERVER_ERROR);

        throw new ApiException('发生了一些错误', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      if (isUndefined(mdata.id)) {
        mdata.id = id;
        return success(`删除${this.apiName}成功`, mdata);
      }
    } else {
      const entities = await this.repository.findBy({
        id: In(ids),
      } as unknown as varType['FW']);

      if (entities.length == 0) throw new ApiException(`删除失败，删除的${this.apiName}不存在`, HttpStatus.NOT_FOUND);

      let mdatas: paramType['M'][];

      // 删除
      try {
        mdatas = await this.repository.remove(entities);
      } catch (error) {
        throw new ApiException('发生了一些错误', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      if (mdatas.length > 0) {
        return success(`批量删除${this.apiName}成功`, mdatas);
      }
    }
  }

  /**
   * 显示
   * @param {CommonShowHiddenDto} commonShowHiddenDto 显示信息
   * @return {Promise<Result>} result
   */
  async show({ ids, codes }: CommonShowHiddenDto): Promise<Result> {
    let entities: paramType['M'][];

    if (ids) {
      entities = await this.repository.findBy({
        id: In(ids),
        hidden: true,
      } as unknown as varType['FW']);
    } else {
      entities = await this.repository.findBy({
        code: In(codes),
        hidden: true,
      } as unknown as varType['FW']);
    }

    if (entities.length == 0) throw new ApiException(`显示失败，${this.apiName}已显示`, HttpStatus.NOT_IMPLEMENTED);

    entities.map(entitie => {
      entitie.hidden = false;
      return entitie;
    });

    // 更新信息
    const menus = await this.repository.save(entities);

    if (menus.length > 0) {
      return success(`显示${this.apiName}成功`, menus);
    }
  }

  /**
   * 隐藏
   * @param {CommonShowHiddenDto} commonShowHiddenDto 隐藏信息
   * @return {Promise<Result>} result
   */
  async hidden({ ids, codes }: CommonShowHiddenDto): Promise<Result> {
    let entities: paramType['M'][];

    if (ids) {
      entities = await this.repository.findBy({
        id: In(ids),
        hidden: false,
      } as unknown as varType['FW']);
    } else {
      entities = await this.repository.findBy({
        code: In(codes),
        hidden: false,
      } as unknown as varType['FW']);
    }

    if (entities.length == 0) throw new ApiException(`隐藏失败，${this.apiName}已隐藏`, HttpStatus.NOT_IMPLEMENTED);

    entities.map(entitie => {
      entitie.hidden = true;
      return entitie;
    });

    // 更新信息
    const menus = await this.repository.save(entities);

    if (menus.length > 0) {
      return success(`隐藏${this.apiName}成功`, menus);
    }
  }

  /**
   * 启用
   * @param {CommonEnableDisableDto} commonEnableDisableDto 启用信息
   * @return {Promise<Result>} result
   */
  async enable({ ids, codes }: CommonEnableDisableDto): Promise<Result> {
    let entities: paramType['M'][];

    if (ids) {
      entities = await this.repository.findBy({
        id: In(ids),
        status: false,
      } as unknown as varType['FW']);
    } else {
      entities = await this.repository.findBy({
        code: In(codes),
        status: false,
      } as unknown as varType['FW']);
    }

    if (entities.length == 0) throw new ApiException(`启用失败，${this.apiName}已启用`, HttpStatus.NOT_IMPLEMENTED);

    entities.map(entitie => {
      entitie.status = true;
      return entitie;
    });

    // 更新信息
    const mdatas = await this.repository.save(entities);

    if (mdatas.length > 0) {
      return success(`启用${this.apiName}成功`, mdatas);
    }
  }

  /**
   * 禁用
   * @param {CommonEnableDisableDto} commonEnableDisableDto 禁用信息
   * @return {Promise<Result>} result
   */
  async disable({ ids, codes }: CommonEnableDisableDto): Promise<Result> {
    let entities: paramType['M'][];

    if (ids) {
      entities = await this.repository.findBy({
        id: In(ids),
        status: true,
      } as unknown as varType['FW']);
    } else {
      entities = await this.repository.findBy({
        code: In(codes),
        status: true,
      } as unknown as varType['FW']);
    }

    if (entities.length == 0) throw new ApiException(`禁用失败，${this.apiName}已禁用`, HttpStatus.NOT_IMPLEMENTED);

    entities.map(entitie => {
      entitie.status = false;
      return entitie;
    });

    // 更新信息
    const mdatas = await this.repository.save(entities);

    if (mdatas.length > 0) {
      return success(`禁用${this.apiName}成功`, mdatas);
    }
  }

  /**
   * 排序
   * @param {CommonSortDto} commonSortDto 排序信息
   * @return {Promise<Result>} result
   */
  async sort({ ids, type, typeName, order }: CommonSortDto): Promise<Result> {
    const queryBuilder = this.repository.createQueryBuilder('alias').orderBy('alias.sort', order || 'ASC');

    if (type && typeName) queryBuilder.andWhere(`alias.${typeName} = :type`, { type });

    const mdatas = await queryBuilder.getMany();

    mdatas.forEach(async (mdata, index) => {
      // 查询现有的排序
      const existing = await this.repository
        .createQueryBuilder('alias')
        .select(['alias.id', 'alias.sort'])
        .where('alias.id = :id', { id: ids[index] })
        .getOne();

      // 判断当前排序和现有排序
      if (mdata.sort !== existing.sort) {
        // 更新现有排序为当前排序
        await this.repository.save<paramType['M']>(this.repository.merge(existing, { sort: mdata.sort }));
      }
    });

    return success(`${this.apiName}排序成功`);
  }

  // ----------------------------------------------------------------------------
  // @ 查询处理
  // ----------------------------------------------------------------------------

  /**
   * 创建查询构建器
   * @param alias
   * @param queryRunner
   * @returns SelectQueryBuilder<paramType['M']>
   */
  createQueryBuilder(alias?: string, queryRunner?: QueryRunner): SelectQueryBuilder<paramType['M']> {
    return this.repository.createQueryBuilder(alias, queryRunner);
  }

  /**
   * 通过条件查询 (第一个实体)
   * @param where
   * @returns Promise<paramType['M']>
   */
  async findOneBy(where: varType['FW'][] | varType['FW']): Promise<paramType['M']> {
    return await this.repository.findOneBy(where);
  }

  /**
   * 通过条件查询
   * @param where
   * @returns Promise<paramType['M'][]>
   */
  async findBy(where: varType['FW'][] | varType['FW']): Promise<paramType['M'][]> {
    return await this.repository.findBy(where);
  }
}
