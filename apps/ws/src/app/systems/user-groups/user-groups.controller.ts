import { Controller, UseGuards, Post, Body, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DataStateArgs, Result } from '@weishour/core/interfaces';
import { User } from '@weishour/core/decorators';
import { JwtAuthGuard } from '@weishour/core/guards';
import { CommonSortDto, CommonEnableDisableDto } from '@ws/common/dtos';
import { UserGroupsService } from './user-groups.service';
import { UserGroupEntity } from './user-group.entity';
import { AddGroupGridDto, EditGroupGridDto, DeleteGroupGridDto } from './dtos';

@ApiTags('用户组管理')
@UseGuards(JwtAuthGuard)
@Controller()
export class UserGroupsController {
  constructor(private userGroupsService: UserGroupsService) {}

  @Post('grid')
  @ApiOperation({ summary: '获取用户组表格数据' })
  async grid(@User('id') userId: number, @Body() dataStateArgs: DataStateArgs): Promise<Result> {
    return await this.userGroupsService.getGrid(userId, dataStateArgs);
  }

  @Post('grid/add')
  @ApiOperation({ summary: '新增用户组表格数据' })
  async addGrid(@User('id') userId: number, @Body('value') addGroupGridDto: AddGroupGridDto): Promise<Result> {
    addGroupGridDto.userId = userId;
    return await this.userGroupsService.addGrid(addGroupGridDto);
  }

  @Post('grid/edit')
  @ApiOperation({ summary: '修改用户组表格数据' })
  async editGrid(@User('id') userId: number, @Body('value') editGroupGridDto: EditGroupGridDto): Promise<Result> {
    editGroupGridDto.userId = userId;
    return await this.userGroupsService.editGrid(editGroupGridDto);
  }

  @Post('grid/remove')
  @ApiOperation({ summary: '删除用户组表格数据' })
  async removeGrid(@User('id') userId: number, @Body() deleteGroupGridDto: DeleteGroupGridDto): Promise<Result> {
    deleteGroupGridDto.userId = userId;
    return await this.userGroupsService.removeGrid(deleteGroupGridDto);
  }

  @Post('grid/batch')
  @ApiOperation({ summary: '批量用户组表格数据' })
  async batchGrid(@Body('deleted') deletedDatas: UserGroupEntity[]): Promise<Result> {
    return await this.userGroupsService.batchRemoveGrid(deletedDatas);
  }

  @Post('add')
  @ApiOperation({ summary: '新增用户组数据' })
  async add(@User('id') userId: number, @Body() addGroupGridDto: AddGroupGridDto): Promise<Result> {
    addGroupGridDto.userId = userId;
    return await this.userGroupsService.add(addGroupGridDto);
  }

  @Post('edit')
  @ApiOperation({ summary: '修改用户组数据' })
  async Grid(@User('id') userId: number, @Body() editGroupGridDto: EditGroupGridDto): Promise<Result> {
    editGroupGridDto.userId = userId;
    return await this.userGroupsService.edit(editGroupGridDto);
  }

  @Post('remove')
  @ApiOperation({ summary: '删除用户组数据' })
  async remove(@User('id') userId: number, @Body() deleteGroupGridDto: DeleteGroupGridDto): Promise<Result> {
    deleteGroupGridDto.userId = userId;
    return await this.userGroupsService.remove(deleteGroupGridDto);
  }

  @Post('enable')
  @ApiOperation({ summary: '启用用户组表格数据' })
  async enable(@User('id') userId: number, @Body() commonEnableDisableDto: CommonEnableDisableDto): Promise<Result> {
    commonEnableDisableDto.userId = userId;
    return await this.userGroupsService.enable(commonEnableDisableDto);
  }

  @Post('disable')
  @ApiOperation({ summary: '禁用用户组表格数据' })
  async disable(@User('id') userId: number, @Body() commonEnableDisableDto: CommonEnableDisableDto): Promise<Result> {
    commonEnableDisableDto.userId = userId;
    return await this.userGroupsService.disable(commonEnableDisableDto);
  }

  @Post('sort')
  @ApiOperation({ summary: '用户组排序' })
  async sort(@User('id') userId: number, @Body() commonSortDto: CommonSortDto): Promise<Result> {
    commonSortDto.userId = userId;
    return await this.userGroupsService.sort(commonSortDto);
  }

  @Get('users/:userGroupId')
  @ApiOperation({ summary: '获取指定用户组的用户' })
  async getRoles(@User('id') operatorId: number, @Param('userGroupId') userGroupId: number): Promise<Result> {
    return await this.userGroupsService.getUsers(userGroupId);
  }
}
