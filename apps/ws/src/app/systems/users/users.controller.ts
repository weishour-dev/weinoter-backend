import { Controller, UseGuards, Get, Param, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '@weishour/core/guards';
import { DataStateArgs, Result } from '@weishour/core/interfaces';
import { User } from '@weishour/core/decorators';
import { CommonSortDto } from '@ws/common/dtos';
import { UsersService } from './users.service';
import { UserEntity } from './user.entity';
import {
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

@ApiTags('用户管理')
@UseGuards(JwtAuthGuard)
@Controller()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('grid')
  @ApiOperation({ summary: '获取用户表格数据' })
  async grid(@User('id') userId: number, @Body() dataStateArgs: DataStateArgs): Promise<Result> {
    return await this.usersService.getGrid(userId, dataStateArgs);
  }

  @Post('grid/add')
  @ApiOperation({ summary: '新增用户表格数据' })
  async addGrid(@User('id') userId: number, @Body('value') addUserGridDto: AddUserGridDto): Promise<Result> {
    addUserGridDto.userId = userId;
    return await this.usersService.addGrid(addUserGridDto);
  }

  @Post('grid/edit')
  @ApiOperation({ summary: '修改用户表格数据' })
  async editGrid(@User('id') userId: number, @Body('value') editUserGridDto: EditUserGridDto): Promise<Result> {
    editUserGridDto.userId = userId;
    return await this.usersService.editGrid(editUserGridDto);
  }

  @Post('grid/remove')
  @ApiOperation({ summary: '删除用户表格数据' })
  async removeGrid(@User('id') userId: number, @Body() deleteUserGridDto: DeleteUserGridDto): Promise<Result> {
    deleteUserGridDto.userId = userId;
    return await this.usersService.removeGrid(deleteUserGridDto);
  }

  @Post('grid/batch')
  @ApiOperation({ summary: '批量用户表格数据' })
  async batchGrid(@Body('deleted') deletedDatas: UserEntity[]): Promise<Result> {
    return await this.usersService.batchRemoveGrid(deletedDatas);
  }

  @Get()
  @ApiOperation({ summary: '获取所有用户' })
  async getAll(): Promise<Result> {
    return await this.usersService.getAll();
  }

  @Post('casbin/permissions')
  @ApiOperation({ summary: '获取用户以及继承的所有权限' })
  async getImplicitResourcesForUser(@Body('username') username: string): Promise<Result> {
    return await this.usersService.getImplicitResourcesForUser(username);
  }

  @Get('departments/:userId')
  @ApiOperation({ summary: '获取部门' })
  async getDepartments(@User('id') operatorId: number, @Param('userId') userId: number): Promise<Result> {
    return await this.usersService.getDepartments(userId);
  }

  @Get('groups/:userId')
  @ApiOperation({ summary: '获取用户组' })
  async getUserGroups(@User('id') operatorId: number, @Param('userId') userId: number): Promise<Result> {
    return await this.usersService.getUserGroups(userId);
  }

  @Get('roles/:userId')
  @ApiOperation({ summary: '获取角色' })
  async getRoles(@User('id') operatorId: number, @Param('userId') userId: number): Promise<Result> {
    return await this.usersService.getRoles(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取单个用户' })
  async get(@Param('id') id: number): Promise<Result> {
    return await this.usersService.getOne(id);
  }

  @Post('profile/account')
  @ApiOperation({ summary: '修改账户' })
  async profileAccount(@User('id') userId: number, @Body() profileAccountDto: ProfileAccountDto): Promise<Result> {
    profileAccountDto.userId = userId;
    return await this.usersService.profileAccount(profileAccountDto);
  }

  @Post('profile/password')
  @ApiOperation({ summary: '修改密码' })
  async profilePassword(@User('id') userId: number, @Body() profilePasswordDto: ProfilePasswordDto): Promise<Result> {
    profilePasswordDto.userId = userId;
    return await this.usersService.profilePassword(profilePasswordDto);
  }

  @Post('set/departments')
  @ApiOperation({ summary: '设置部门' })
  async setDepartments(@User('id') operatorId: number, @Body() setDepartmentsDto: SetDepartmentsDto): Promise<Result> {
    setDepartmentsDto.operatorId = operatorId;
    return await this.usersService.setDepartments(setDepartmentsDto);
  }

  @Post('batch/set/department')
  @ApiOperation({ summary: '批量设置部门' })
  async batchSetDepartment(
    @User('id') operatorId: number,
    @Body() batchSetDepartmentDto: BatchSetDepartmentDto,
  ): Promise<Result> {
    batchSetDepartmentDto.operatorId = operatorId;
    return await this.usersService.batchSetDepartment(batchSetDepartmentDto);
  }

  @Post('remove/department')
  @ApiOperation({ summary: '撤销部门' })
  async removeDepartment(
    @User('id') operatorId: number,
    @Body() removeDepartmentDto: RemoveDepartmentDto,
  ): Promise<Result> {
    removeDepartmentDto.operatorId = operatorId;
    return await this.usersService.removeDepartment(removeDepartmentDto);
  }

  @Post('set/roles')
  @ApiOperation({ summary: '设置角色' })
  async setRoles(@User('id') operatorId: number, @Body() setRolesDto: SetRolesDto): Promise<Result> {
    setRolesDto.operatorId = operatorId;
    return await this.usersService.setRoles(setRolesDto);
  }

  @Post('remove/role')
  @ApiOperation({ summary: '撤销角色' })
  async removeRole(@User('id') operatorId: number, @Body() removeRoleDto: RemoveRoleDto): Promise<Result> {
    removeRoleDto.operatorId = operatorId;
    return await this.usersService.removeRole(removeRoleDto);
  }

  @Post('set/groups')
  @ApiOperation({ summary: '设置用户组' })
  async setUserGroups(@User('id') operatorId: number, @Body() setGroupsDto: SetGroupsDto): Promise<Result> {
    setGroupsDto.operatorId = operatorId;
    return await this.usersService.setUserGroups(setGroupsDto);
  }

  @Post('remove/group')
  @ApiOperation({ summary: '移除用户组' })
  async removeUserGroup(@User('id') operatorId: number, @Body() removeGroupDto: RemoveGroupDto): Promise<Result> {
    removeGroupDto.operatorId = operatorId;
    return await this.usersService.removeUserGroup(removeGroupDto);
  }

  @Post('sort')
  @ApiOperation({ summary: '用户排序' })
  async sort(@User('id') userId: number, @Body() commonSortDto: CommonSortDto): Promise<Result> {
    commonSortDto.userId = userId;
    return await this.usersService.sort(commonSortDto);
  }
}
