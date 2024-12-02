import { Controller, UseGuards, Post, Body, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DataStateArgs, Result } from '@weishour/core/interfaces';
import { User, Permission } from '@weishour/core/decorators';
import { JwtAuthGuard } from '@weishour/core/guards';
import { CommonSortDto, CommonEnableDisableDto } from '@ws/common/dtos';
import { RolesService } from './roles.service';
import { RoleEntity } from './role.entity';
import { AddRoleGridDto, EditRoleGridDto, DeleteRoleGridDto } from './dtos';

@ApiTags('角色管理')
@UseGuards(JwtAuthGuard)
@Controller()
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @Post('grid')
  @Permission({ type: 'MENU' })
  @ApiOperation({ summary: '获取角色表格数据' })
  async grid(@User('id') userId: number, @Body() dataStateArgs: DataStateArgs): Promise<Result> {
    return await this.rolesService.getGrid(userId, dataStateArgs);
  }

  @Post('grid/add')
  @ApiOperation({ summary: '新增角色表格数据' })
  async addGrid(@User('id') userId: number, @Body('value') addRoleGridDto: AddRoleGridDto): Promise<Result> {
    addRoleGridDto.userId = userId;
    return await this.rolesService.addGrid(addRoleGridDto);
  }

  @Post('grid/edit')
  @ApiOperation({ summary: '修改角色表格数据' })
  async editGrid(@User('id') userId: number, @Body('value') editRoleGridDto: EditRoleGridDto): Promise<Result> {
    editRoleGridDto.userId = userId;
    return await this.rolesService.editGrid(editRoleGridDto);
  }

  @Post('grid/remove')
  @ApiOperation({ summary: '删除角色表格数据' })
  async removeGrid(@User('id') userId: number, @Body() deleteRoleGridDto: DeleteRoleGridDto): Promise<Result> {
    deleteRoleGridDto.userId = userId;
    return await this.rolesService.removeGrid(deleteRoleGridDto);
  }

  @Post('grid/batch')
  @ApiOperation({ summary: '批量角色表格数据' })
  async batchGrid(@Body('deleted') deletedDatas: RoleEntity[]): Promise<Result> {
    return await this.rolesService.batchRemoveGrid(deletedDatas);
  }

  @Post('add')
  @Permission()
  @ApiOperation({ summary: '新增角色数据' })
  async add(@User('id') userId: number, @Body() addRoleGridDto: AddRoleGridDto): Promise<Result> {
    addRoleGridDto.userId = userId;
    return await this.rolesService.add(addRoleGridDto);
  }

  @Post('edit')
  @Permission()
  @ApiOperation({ summary: '修改角色数据' })
  async edit(@User('id') userId: number, @Body() editRoleGridDto: EditRoleGridDto): Promise<Result> {
    editRoleGridDto.userId = userId;
    return await this.rolesService.edit(editRoleGridDto);
  }

  @Post('remove')
  @Permission()
  @ApiOperation({ summary: '删除角色数据' })
  async remove(@User('id') userId: number, @Body() deleteRoleGridDto: DeleteRoleGridDto): Promise<Result> {
    deleteRoleGridDto.userId = userId;
    return await this.rolesService.remove(deleteRoleGridDto);
  }

  @Post('enable')
  @Permission()
  @ApiOperation({ summary: '启用角色表格数据' })
  async enable(@User('id') userId: number, @Body() commonEnableDisableDto: CommonEnableDisableDto): Promise<Result> {
    commonEnableDisableDto.userId = userId;
    return await this.rolesService.enable(commonEnableDisableDto);
  }

  @Post('disable')
  @Permission()
  @ApiOperation({ summary: '禁用角色表格数据' })
  async disable(@User('id') userId: number, @Body() commonEnableDisableDto: CommonEnableDisableDto): Promise<Result> {
    commonEnableDisableDto.userId = userId;
    return await this.rolesService.disable(commonEnableDisableDto);
  }

  @Post('sort')
  @Permission()
  @ApiOperation({ summary: '角色排序' })
  async sort(@User('id') userId: number, @Body() commonSortDto: CommonSortDto): Promise<Result> {
    commonSortDto.userId = userId;
    return await this.rolesService.sort(commonSortDto);
  }

  @Get('users/:roleId')
  @ApiOperation({ summary: '获取指定角色的用户' })
  async getRoles(@User('id') operatorId: number, @Param('roleId') roleId: number): Promise<Result> {
    return await this.rolesService.getUsers(roleId);
  }
}
