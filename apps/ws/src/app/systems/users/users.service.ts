import { Injectable, HttpStatus, forwardRef, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult, In } from 'typeorm';
import { ApiException } from '@weishour/core/exceptions';
import { DataStateArgs, Result } from '@weishour/core/interfaces';
import { WsConfigService } from '@weishour/core/services';
import { CryptoUtil, CommonUtil, success } from '@weishour/core/utils';
import { BaseService, RbacService } from '@ws/common/services';
import { TokenPayload } from '@ws/common/interfaces';
import { DepartmentsService } from '@ws/app/systems/departments/departments.service';
import { RolesService } from '@ws/app/systems/roles/roles.service';
import { RoleEntity } from '@ws/app/systems/roles/role.entity';
import { UserGroupsService } from '@ws/app/systems/user-groups/user-groups.service';
import { UserGroupEntity } from '@ws/app/systems/user-groups/user-group.entity';
import {
  CreateUserDto,
  ProfileAccountDto,
  ProfilePasswordDto,
  SetDepartmentsDto,
  BatchSetDepartmentDto,
  RemoveDepartmentDto,
  SetRolesDto,
  RemoveRoleDto,
  SetGroupsDto,
  RemoveGroupDto,
} from './dtos';
import { AddUserGridDto, EditUserGridDto, DeleteUserGridDto } from './dtos/grid';
import { UserEntity } from './user.entity';
import { omit, filter, reject, isNull, last } from 'lodash';

@Injectable()
export class UsersService extends BaseService<{
  M: UserEntity;
  A: AddUserGridDto;
  E: EditUserGridDto;
  D: DeleteUserGridDto;
}> {
  apiName = '用户';

  constructor(
    @InjectRepository(UserEntity) private usersRepository: Repository<UserEntity>,
    private wsConfigService: WsConfigService,
    private rbacService: RbacService,
    @Inject(forwardRef(() => DepartmentsService)) private departmentsService: DepartmentsService,
    @Inject(forwardRef(() => RolesService)) private rolesService: RolesService,
    @Inject(forwardRef(() => UserGroupsService)) private userGroupsService: UserGroupsService,
    private cryptoUtil: CryptoUtil,
    commonUtil: CommonUtil,
  ) {
    super(usersRepository, commonUtil);
  }

  /**
   * 获取所有用户（表格）
   * @param userId
   * @param where
   */
  async getGrid(userId = 0, dataStateArgs: DataStateArgs): Promise<Result<UserEntity[]>> {
    let userQueryBuilder = this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .orderBy('user.id', 'DESC')
      .leftJoinAndSelect('user.roles', 'roles')
      .leftJoinAndSelect('user.userGroups', 'userGroups');

    // 复杂条件
    const where = dataStateArgs?.where;
    userQueryBuilder = this.commonUtil.complexWhere<UserEntity>(where, userQueryBuilder);

    const users = await userQueryBuilder.getMany();

    if (users) return success('获取所有用户成功', users);
  }

  /**
   * 创建用户（表格）
   * @param {AddUserGridDto} addUserGridDto 菜单信息
   * @return {Promise<Result>} result
   */
  async addGrid(addUserGridDto: AddUserGridDto): Promise<Result> {
    let user: UserEntity;

    try {
      // 密码加密
      addUserGridDto.password = await this.cryptoUtil.encryptPassword(addUserGridDto.password);

      user = await this.usersRepository.save<UserEntity>(this.usersRepository.create(omit(addUserGridDto, ['id'])));
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') throw new ApiException('用户已存在', HttpStatus.CONFLICT);
      throw new ApiException('发生了一些错误', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return success('新增成功', user);
  }

  /**
   * 修改用户（表格）
   * @param {EditUserGridDto} editUserGridDto 用户信息
   * @return {Promise<Result>} result
   */
  async editGrid({ id, ...data }: EditUserGridDto): Promise<Result> {
    let user: UserEntity;
    const existing = await this.usersRepository.findOneBy({ id });
    if (!existing) throw new ApiException(`修改失败，ID 为 '${id}' 的用户不存在`, HttpStatus.NOT_FOUND);

    try {
      if (!data.password.startsWith('$argon2id$v=19$m=')) {
        // 密码加密
        data.password = await this.cryptoUtil.encryptPassword(data.password);
      } else {
        if (data.password !== existing.password) data.password = existing.password;
      }

      user = await this.usersRepository.save<UserEntity>(this.usersRepository.merge(existing, data));
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') throw new ApiException('用户已存在', HttpStatus.CONFLICT);
      throw new ApiException('发生了一些错误', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return success('修改用户成功', user);
  }

  /**
   * 创建用户
   * @param createUserDto 用户信息
   */
  async create(createUserDto: CreateUserDto): Promise<Partial<UserEntity>> {
    const user: Partial<UserEntity> = await this.usersRepository.save<UserEntity>(
      this.usersRepository.create(createUserDto),
    );

    return omit(user, ['password', 'refreshToken']);
  }

  /**
   * 修改账户
   * @param {ProfileAccountDto} profileAccountDto
   */
  async profileAccount(profileAccountDto: ProfileAccountDto): Promise<Result> {
    const existing = await this.usersRepository
      .createQueryBuilder('user')
      .where('user.id = :id', { id: profileAccountDto.userId })
      .getOne();

    try {
      await this.usersRepository.save<UserEntity>(this.usersRepository.merge(existing, profileAccountDto));
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') throw new ApiException('用户已存在', HttpStatus.CONFLICT);
      throw new ApiException('发生了一些错误', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return success('修改账户成功');
  }

  /**
   * 修改密码
   * @param {ProfilePasswordDto} profilePasswordDto
   */
  async profilePassword(profilePasswordDto: ProfilePasswordDto): Promise<Result> {
    const existing = await this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.id = :id', { id: profilePasswordDto.userId })
      .getOne();

    const isConform = await this.cryptoUtil.checkPassword(existing.password, profilePasswordDto.currentPassword);

    // 验证当前密码
    if (!isConform) {
      throw new ApiException('当前密码不正确', HttpStatus.EXPECTATION_FAILED);
    }

    try {
      const password = await this.cryptoUtil.encryptPassword(profilePasswordDto.newPassword);
      await this.usersRepository.save<UserEntity>(this.usersRepository.merge(existing, { password }));
    } catch (error) {
      throw new ApiException('发生了一些错误', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return success('修改密码成功');
  }

  /**
   * 获取用户以及继承的所有权限
   * @param {string} username
   */
  async getImplicitResourcesForUser(username: string): Promise<Result> {
    let policy = '';
    const rbacConfig = this.wsConfigService.get('rbac');
    // 用户主体
    username = `${rbacConfig.userPrefix}${rbacConfig.separator}${username}`;

    // 获取当前用户以及继承的所有权限
    const permissions = await this.rbacService.getImplicitResourcesForUser(username);
    // 将权限配置转换为字符串文本
    const permissionArray = permissions.map(permission => permission.join(', '));
    for (const permission of permissionArray) {
      const isLast = last(permissionArray) === permission;
      const suffix = isLast ? '' : '\n';
      policy += `p, ${permission}${suffix}`;
    }

    return success('获取用户以及继承的所有权限成功', policy);
  }

  // ----------------------------------------------------------------------------
  // @ 部门
  // ----------------------------------------------------------------------------

  /**
   * 获取部门
   * @param userId
   * @returns
   */
  async getDepartments(userId: number): Promise<Result> {
    const existing = await this.usersRepository.findOne({ where: { id: userId } });

    if (!existing) throw new ApiException(`获取部门失败，ID 为 '${userId}' 的用户不存在`, HttpStatus.NOT_FOUND);

    const departments = await this.departmentsService.findBy({
      id: In(existing.departmentIds ?? []),
    });

    return success('获取部门成功', departments);
  }

  /**
   * 设置部门
   * @param setDepartmentsDto
   * @returns
   */
  async setDepartments({ userId, departmentIds }: SetDepartmentsDto): Promise<Result> {
    const existing = await this.usersRepository.findOneBy({ id: userId });
    if (!existing) throw new ApiException(`设置部门失败，ID 为 '${userId}' 的用户不存在`, HttpStatus.NOT_FOUND);

    existing.departmentIds = departmentIds;
    const user = await this.usersRepository.save<UserEntity>(existing);

    // 更新部门人数
    await this.departmentsService.membersCountHandle(departmentIds);

    return success('设置部门成功', user);
  }

  /**
   * 批量设置部门
   * @param batchSetDepartmentDto
   * @returns
   */
  async batchSetDepartment({ userIds, departmentId }: BatchSetDepartmentDto): Promise<Result> {
    const entities = await this.usersRepository.findBy({ id: In(userIds) });
    if (entities.length == 0) throw new ApiException(`批量设置部门失败，批量设置的用户不存在`, HttpStatus.NOT_FOUND);

    entities.map(entitie => {
      isNull(entitie.departmentIds)
        ? (entitie.departmentIds = [departmentId])
        : entitie.departmentIds.push(departmentId);
      return entitie;
    });

    // 更新用户所属部门
    const users = await this.usersRepository.save<UserEntity>(entities);

    // 更新部门人数
    await this.departmentsService.membersCountHandle([departmentId]);

    return success('批量设置部门成功', users);
  }

  /**
   * 撤销部门
   * @param removeDepartmentDto
   * @returns
   */
  async removeDepartment({ userIds, departmentId }: RemoveDepartmentDto): Promise<Result> {
    const entities = await this.usersRepository.findBy({ id: In(userIds) });

    if (entities.length == 0) throw new ApiException(`撤销部门失败，撤销的用户不存在`, HttpStatus.NOT_FOUND);

    entities.map(entitie => {
      entitie.departmentIds = reject(entitie.departmentIds, id => id == departmentId);
      return entitie;
    });

    // 更新用户所属部门
    const users = await this.usersRepository.save<UserEntity>(entities);

    // 更新部门人数
    await this.departmentsService.membersCountHandle([departmentId]);

    return success('撤销部门成功', users);
  }

  // ----------------------------------------------------------------------------
  // @ 角色
  // ----------------------------------------------------------------------------

  /**
   * 获取角色
   * @param userId
   * @returns
   */
  async getRoles(userId: number): Promise<Result> {
    const existing = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });

    if (!existing) throw new ApiException(`获取角色失败，ID 为 '${userId}' 的用户不存在`, HttpStatus.NOT_FOUND);

    return success('获取角色成功', existing.roles);
  }

  /**
   * 设置角色
   * @param setRolesDto
   * @returns
   */
  async setRoles({ userId, roleIds }: SetRolesDto): Promise<Result> {
    const existing = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });
    if (!existing) throw new ApiException(`设置角色失败，ID 为 '${userId}' 的用户不存在`, HttpStatus.NOT_FOUND);

    const beforeRoles = existing.roles;
    existing.roles = await this.rolesService.findBy({ id: In(roleIds) });
    const afterRoles = existing.roles;

    const user = await this.usersRepository.save<UserEntity>(existing);

    // casbin - 为用户分配角色
    await this.rbacService.mandate('role', user.username, beforeRoles, afterRoles);

    return success('设置角色成功', user);
  }

  /**
   * 撤销角色
   * @param removeRoleDto
   * @returns
   */
  async removeRole({ userIds, roleId }: RemoveRoleDto): Promise<Result> {
    const entities = await this.usersRepository.find({
      where: { id: In(userIds) },
      relations: ['roles'],
    });

    let roleData: RoleEntity;

    if (entities.length == 0) throw new ApiException(`撤销角色失败，撤销的用户不存在`, HttpStatus.NOT_FOUND);

    entities.map(existing => {
      existing.roles = filter(existing.roles, role => {
        if (role.id === roleId) roleData = role;
        return role.id !== roleId;
      });
      return existing;
    });

    const users = await this.usersRepository.save<UserEntity>(entities);

    // casbin - 为用户撤销角色
    for (const user of users) {
      await this.rbacService.unMandate('role', user.username, roleData.code);
    }

    return success('撤销角色成功', users);
  }

  // ----------------------------------------------------------------------------
  // @ 用户组
  // ----------------------------------------------------------------------------

  /**
   * 获取用户组
   * @param userId
   * @returns
   */
  async getUserGroups(userId: number): Promise<Result> {
    const existing = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['userGroups'],
    });

    if (!existing) throw new ApiException(`获取用户组失败，ID 为 '${userId}' 的用户不存在`, HttpStatus.NOT_FOUND);

    return success('获取用户组成功', existing.userGroups);
  }

  /**
   * 设置用户组
   * @param setGroupsDto
   * @returns
   */
  async setUserGroups({ userId, groupIds }: SetGroupsDto): Promise<Result> {
    const existing = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['userGroups'],
    });
    if (!existing) throw new ApiException(`设置用户组失败，ID 为 '${userId}' 的用户不存在`, HttpStatus.NOT_FOUND);

    const beforeGroups = existing.userGroups;
    existing.userGroups = await this.userGroupsService.findBy({ id: In(groupIds) });
    const afterGroups = existing.userGroups;

    const user = await this.usersRepository.save<UserEntity>(existing);

    // casbin - 为用户分配用户组
    await this.rbacService.mandate('group', user.username, beforeGroups, afterGroups);

    return success('设置用户组成功', user);
  }

  /**
   * 移除用户组
   * @param removeGroupDto
   * @returns
   */
  async removeUserGroup({ userIds, groupId }: RemoveGroupDto): Promise<Result> {
    const entities = await this.usersRepository.find({
      where: { id: In(userIds) },
      relations: ['userGroups'],
    });

    if (entities.length == 0) throw new ApiException(`移除用户组失败，撤销的用户不存在`, HttpStatus.NOT_FOUND);

    let groupData: UserGroupEntity;

    entities.map(existing => {
      existing.userGroups = filter(existing.userGroups, userGroup => {
        if (userGroup.id === groupId) groupData = userGroup;
        return userGroup.id !== groupId;
      });
      return existing;
    });
    const users = await this.usersRepository.save<UserEntity>(entities);

    // casbin - 为用户撤销用户组
    for (const user of users) {
      await this.rbacService.unMandate('group', user.username, groupData.code);
    }

    return success('移除用户组成功', users);
  }

  /**
   * 获取所有用户
   */
  async getAll(): Promise<Result> {
    const users = await this.usersRepository.find();
    if (users) return success('获取所有用户成功', users);
  }

  /**
   * 获取单个用户
   */
  async getOne(id: number): Promise<Result> {
    const user = await this.getById(id);

    if (user) {
      return success('获取用户成功', user);
    } else {
      throw new ApiException(`获取失败，ID 为 '${id}' 的用户不存在`, HttpStatus.NOT_FOUND);
    }
  }

  /**
   * 通过id查询用户
   * @param {number} id
   */
  async getById(id: number): Promise<UserEntity> {
    return await this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.refreshToken')
      .where('user.id = :id', { id })
      .getOne();
  }

  /**
   * 通过ids查询用户
   * @param {number[]} ids
   */
  async getByIds(ids: number[]): Promise<UserEntity[]> {
    if (ids.length === 0) return [];

    return await this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.id IN (:...ids)', { ids })
      .getMany();
  }

  /**
   * 通过名称查询用户
   * @param {string} username 用户名称
   */
  async getByName(username: string): Promise<Partial<UserEntity>> {
    return await this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.username = :username', { username })
      .getOne();
  }

  /**
   * 通过邮箱查询用户
   * @param {string} email 邮箱
   */
  async getByEmail(email: string): Promise<Partial<UserEntity>> {
    return await this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
  }

  /**
   * 获取部门的用户列表
   * @param departmentId
   */
  async getListByDepartmentId(departmentId: number): Promise<UserEntity[]> {
    const users = this.usersRepository
      .createQueryBuilder('user')
      .where('FIND_IN_SET(:departmentId, user.departmentIds)', { departmentId })
      .getMany();

    return users;
  }

  /**
   * 更新remember_me状态
   * @param {number} userId 用户id
   * @param {boolean} rememberMe
   */
  async updateRememberMe(userId: number, rememberMe: boolean): Promise<UpdateResult> {
    return await this.usersRepository.update(userId, { rememberMe });
  }

  // ----------------------------------------------------------------------------
  // @ 令牌处理
  // ----------------------------------------------------------------------------

  /**
   * 验证访问令牌
   * @param {TokenPayload} payload 访问令牌载荷
   */
  async verifyToken(payload: TokenPayload): Promise<UserEntity> {
    const user = await this.getById(payload.userId);
    if (!user) throw new ApiException('访问令牌无效', HttpStatus.UNAUTHORIZED);
    return user;
  }

  /**
   * 设置对应用户的刷新令牌
   * @param {} refreshToken 刷新令牌
   * @param {} userId 用户id
   */
  async setRefreshToken(refreshToken: string, userId: number): Promise<void> {
    const hashedRefreshToken = await this.cryptoUtil.encryptPassword(refreshToken);
    await this.usersRepository.update(userId, { refreshToken: hashedRefreshToken });
  }

  /**
   * 验证刷新令牌
   * @param {string} refreshToken 刷新令牌
   * @param {number} userId 用户id
   */
  async verifyRefreshToken(refreshToken: string, userId: number): Promise<UserEntity> {
    const user = await this.getById(userId);

    if (user) {
      const isRefreshTokenMatching = await this.cryptoUtil.checkPassword(user.refreshToken, refreshToken);

      if (isRefreshTokenMatching) return user;
    }

    throw new ApiException('刷新令牌无效', HttpStatus.UNAUTHORIZED);
  }

  /**
   * 删除刷新令牌
   * @param {number} userId 用户id
   */
  async removeRefreshToken(userId: number): Promise<UpdateResult> {
    return await this.usersRepository.update(userId, { refreshToken: '' });
  }
}
