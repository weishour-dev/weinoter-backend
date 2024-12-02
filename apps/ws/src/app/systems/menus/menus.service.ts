import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, TreeRepository } from 'typeorm';
import { ApiException } from '@weishour/core/exceptions';
import { DataStateArgs, Result } from '@weishour/core/interfaces';
import { CommonUtil, success } from '@weishour/core/utils';
import { BaseService, RbacService } from '@ws/common/services';
import { GetParam } from '@ws/common/interfaces';
import { CommonSortDto, CommonEnableDisableDto } from '@ws/common/dtos';
import { AddMenuGridDto, EditMenuGridDto, DeleteMenuGridDto } from './dtos';
import { MenuEntity } from './menu.entity';
import { omit, cloneDeep } from 'lodash';
@Injectable()
export class MenusService extends BaseService<{
  M: MenuEntity;
  A: AddMenuGridDto;
  E: EditMenuGridDto;
  D: DeleteMenuGridDto;
}> {
  apiName = '菜单';

  constructor(
    @InjectRepository(MenuEntity) private menusRepository: TreeRepository<MenuEntity>,
    private rbacService: RbacService,
    commonUtil: CommonUtil,
  ) {
    super(menusRepository, commonUtil);
  }

  /**
   * 获取所有菜单（表格）
   */
  async getGrid(userId = 0, dataStateArgs: DataStateArgs): Promise<Result<MenuEntity[]>> {
    let menus = await this.menusRepository.findTreesBy();

    // 菜单排序处理
    menus = this.sortNavigation(cloneDeep(menus));

    if (menus) return success('获取所有菜单成功', menus);
  }

  /**
   * 创建菜单（表格）
   * @param {AddMenuGridDto} addMenuGridDto 菜单信息
   * @return {Promise<Result>} result
   */
  async addGrid(addMenuGridDto: AddMenuGridDto): Promise<Result> {
    let menu: MenuEntity;

    try {
      // 父级判断处理
      const parentId = addMenuGridDto.taskData.parentId;
      if (parentId) {
        const parent: MenuEntity = await this.menusRepository.findOneBy({ id: parentId });
        if (parent) {
          addMenuGridDto.taskData.parent = parent;
          addMenuGridDto.taskData.level = parent.level + 1; // 菜单层级
        }
      }

      menu = await this.menusRepository.save<MenuEntity>(
        this.menusRepository.create(omit(addMenuGridDto.taskData, ['id'])),
      );
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') throw new ApiException('菜单已存在', HttpStatus.CONFLICT);
      throw new ApiException('发生了一些错误', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return success('新增成功', menu);
  }

  /**
   * 修改菜单（表格）
   * @param {EditMenuGridDto} editMenuGridDto 菜单信息
   * @return {Promise<Result>} result
   */
  async editGrid({ id, ...data }: EditMenuGridDto): Promise<Result> {
    let menu: MenuEntity;
    const existing = await this.menusRepository.findOneBy({ id });
    if (!existing) throw new ApiException(`修改失败，ID 为 '${id}' 的菜单不存在`, HttpStatus.NOT_FOUND);

    try {
      // 父级判断处理
      const parentId = data.parentId;
      if (parentId) {
        const parent: MenuEntity = await this.menusRepository.findOneBy({ id: parentId });
        if (parent) {
          data.parent = parent;
          data.level = parent.level + 1; // 菜单层级
        }
      }

      menu = await this.menusRepository.save<MenuEntity>(this.menusRepository.merge(existing, data));
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') throw new ApiException('菜单已存在', HttpStatus.CONFLICT);
      throw new ApiException('发生了一些错误', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return success('修改菜单成功', menu);
  }

  /**
   * 启用菜单
   * @param {CommonEnableDisableDto} commonEnableDisableDto 启用信息
   * @return {Promise<Result>} result
   */
  async enable({ ids }: CommonEnableDisableDto): Promise<Result> {
    const entities = await this.menusRepository.findBy({ id: In(ids), disabled: true });

    if (entities.length == 0) throw new ApiException(`启用失败，菜单已启用`, HttpStatus.NOT_IMPLEMENTED);

    entities.map(entitie => {
      entitie.disabled = false;
      return entitie;
    });

    // 更新菜单
    const menus = await this.menusRepository.save(entities);

    if (menus.length > 0) {
      return success('启用菜单成功', menus);
    }
  }

  /**
   * 禁用菜单
   * @param {CommonEnableDisableDto} commonEnableDisableDto 禁用信息
   * @return {Promise<Result>} result
   */
  async disable({ ids }: CommonEnableDisableDto): Promise<Result> {
    const entities = await this.menusRepository.findBy({ id: In(ids), disabled: false });

    if (entities.length == 0) throw new ApiException(`禁用失败，菜单已禁用`, HttpStatus.NOT_IMPLEMENTED);

    entities.map(entitie => {
      entitie.disabled = true;
      return entitie;
    });

    // 更新菜单
    const menus = await this.menusRepository.save(entities);

    if (menus.length > 0) {
      return success('禁用菜单成功', menus);
    }
  }

  /**
   * 菜单排序
   * @param {CommonSortDto} commonSortDto 排序信息
   * @return {Promise<Result>} result
   */
  async sort({ ids }: CommonSortDto): Promise<Result> {
    const menus = await this.menusRepository.createQueryBuilder('menu').orderBy('menu.sort', 'ASC').getMany();

    menus.forEach(async (menu, index) => {
      // 查询现有的排序
      const existing = await this.menusRepository
        .createQueryBuilder('menu')
        .select(['menu.id', 'menu.sort'])
        .where('menu.id = :id', { id: ids[index] })
        .getOne();

      // 判断当前排序和现有排序
      if (menu.sort !== existing.sort) {
        // 更新现有排序为当前排序
        await this.menusRepository.save<MenuEntity>(this.menusRepository.merge(existing, { sort: menu.sort }));
      }
    });

    return success('菜单排序成功');
  }

  /**
   * 获取上级菜单数据
   */
  async parent(): Promise<Result<MenuEntity[]>> {
    // const menus = await this.menusRepository.findTreesBy({}, { type: Not(In(['basic'])) });
    const menus = await this.menusRepository
      .createQueryBuilder('menu')
      .where('menu.type NOT IN (:...types)', { types: ['basic', 'divider'] })
      .getMany();

    // 额外处理
    for (const menu of menus) {
      const menuChildrens = await this.menusRepository.findDescendants(menu);
      if (menuChildrens.length >= 2) {
        menu['expanded'] = true;
        menu['hasChildren'] = true;
      }
    }

    if (menus) return success('获取上级菜单数据成功', menus);
  }

  /**
   * 获取所有菜单
   */
  async getAll(param: GetParam): Promise<Result> {
    const menusTree = await this.menusRepository.findTreesBy();
    const firstMenu = menusTree[0];

    const menus = await this.menusRepository.createQueryBuilder('menu').orderBy('menu.sort', 'ASC').getMany();

    // 额外处理
    for (const menu of menus) {
      if (param.isSelected === 'true') {
        // 默认第一个菜单为选中状态
        if (menu.id === firstMenu.id) menu['selected'] = true;
      }

      const menuChildrens = await this.menusRepository.findDescendants(menu);
      if (menuChildrens.length >= 2) {
        menu['expanded'] = true;
        menu['hasChildren'] = true;
      }
    }

    if (menus) return success('获取所有菜单数据成功', menus);
  }

  /**
   * 获取所有菜单（树状）
   */
  async getAllTree(): Promise<Result<MenuEntity[]>> {
    let menus = await this.menusRepository.findTreesBy();

    // 菜单排序处理
    menus = this.sortNavigation(cloneDeep(menus));

    if (menus) return success('获取树状菜单数据成功', menus);
  }

  /**
   * 获取导航数据
   */
  async getNavigation(username: string): Promise<Result<MenuEntity[]>> {
    let navigations: MenuEntity[] = [];

    // 超级管理员
    if (['admin'].includes(username)) {
      // 系统的全部菜单
      navigations = await this.menusRepository.findTreesBy();
    } else {
      // 获取用户拥有的菜单ids
      const menuIds = await this.rbacService.getMenus(username);
      // 根据菜单ids筛选菜单
      const menus = await this.menusRepository.findTreesBy({}, { id: In(menuIds) });
      navigations = this.getRbacNavigation(menuIds, cloneDeep(menus));
    }

    // 菜单排序处理
    navigations = this.sortNavigation(cloneDeep(navigations));

    return success('获取导航数据成功', navigations);
  }

  /**
   * 获取单个菜单
   */
  async getOne(id: string): Promise<Result> {
    const menu = await this.menusRepository.createQueryBuilder('menu').where('menu.id = :id', { id }).getOne();

    if (menu) {
      return success('获取菜单成功', menu);
    } else {
      throw new ApiException(`获取失败，ID 为 '${id}' 的菜单不存在`, HttpStatus.NOT_FOUND);
    }
  }

  /**
   * 通过id查询菜单
   * @param {string} id
   */
  async getById(id: string): Promise<MenuEntity> {
    return await this.menusRepository.createQueryBuilder('menu').where('menu.id = :id', { id }).getOne();
  }

  /**
   * 导航权限处理
   * @param menuIds
   * @param menus
   */
  getRbacNavigation(menuIds: number[], menus: MenuEntity[]): MenuEntity[] {
    for (const menu of menus) {
      if (menu.type === 'basic') {
        if (menuIds.includes(menu.id)) continue;
        menu.hidden = true;
      }

      if (['aside', 'collapsable', 'group'].includes(menu.type)) {
        if (menu.children) {
          this.getRbacNavigation(menuIds, menu.children);
        }
      }
    }

    return menus;
  }

  /**
   * 树状菜单排序
   * @param menus
   * @param order
   */
  sortNavigation(menus: MenuEntity[], order: 'asc' | 'desc' = 'desc'): MenuEntity[] {
    menus.sort((aMenu, bMenu) => (order === 'asc' ? bMenu.sort - aMenu.sort : aMenu.sort - bMenu.sort));

    for (const menu of menus) {
      if (menu.children && menu.children.length > 0) this.sortNavigation(menu.children);
    }

    return menus;
  }
}
