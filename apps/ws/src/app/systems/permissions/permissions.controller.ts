import { Controller, UseGuards, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DataStateArgs, Result } from '@weishour/core/interfaces';
import { Permission, User } from '@weishour/core/decorators';
import { JwtAuthGuard } from '@weishour/core/guards';
import { CommonSortDto, CommonEnableDisableDto } from '@ws/common/dtos';
import { PermissionsService } from './permissions.service';
import { PermissionEntity } from './permission.entity';
import { AddPermissionGridDto, EditPermissionGridDto, DeletePermissionGridDto } from './dtos';

@ApiTags('权限管理')
@UseGuards(JwtAuthGuard)
@Controller()
export class PermissionsController {
  constructor(private permissionsService: PermissionsService) {}

  @Post('grid')
  @ApiOperation({ summary: '获取权限表格数据' })
  async grid(@User('id') userId: number, @Body() dataStateArgs: DataStateArgs): Promise<Result> {
    return await this.permissionsService.getGrid(userId, dataStateArgs);
  }

  @Post('grid/add')
  @Permission({ adminAllow: true })
  @ApiOperation({ summary: '新增权限表格数据' })
  async addGrid(
    @User('id') userId: number,
    @Body('value') addPermissionGridDto: AddPermissionGridDto,
  ): Promise<Result> {
    addPermissionGridDto.userId = userId;
    return await this.permissionsService.addGrid(addPermissionGridDto);
  }

  @Post('grid/edit')
  @Permission({ adminAllow: true })
  @ApiOperation({ summary: '修改权限表格数据' })
  async editGrid(
    @User('id') userId: number,
    @Body('value') editPermissionGridDto: EditPermissionGridDto,
  ): Promise<Result> {
    editPermissionGridDto.userId = userId;
    return await this.permissionsService.editGrid(editPermissionGridDto);
  }

  @Post('grid/remove')
  @Permission({ adminAllow: true })
  @ApiOperation({ summary: '删除权限表格数据' })
  async removeGrid(
    @User('id') userId: number,
    @Body() deletePermissionGridDto: DeletePermissionGridDto,
  ): Promise<Result> {
    deletePermissionGridDto.userId = userId;
    return await this.permissionsService.removeGrid(deletePermissionGridDto);
  }

  @Post('grid/batch')
  @Permission({ adminAllow: true })
  @ApiOperation({ summary: '批量权限表格数据' })
  async batchGrid(@Body('deleted') deletedDatas: PermissionEntity[]): Promise<Result> {
    return await this.permissionsService.batchRemoveGrid(deletedDatas);
  }

  @Post('enable')
  @ApiOperation({ summary: '启用权限表格数据' })
  async enable(@User('id') userId: number, @Body() commonEnableDisableDto: CommonEnableDisableDto): Promise<Result> {
    commonEnableDisableDto.userId = userId;
    return await this.permissionsService.enable(commonEnableDisableDto);
  }

  @Post('disable')
  @ApiOperation({ summary: '禁用权限表格数据' })
  async disable(@User('id') userId: number, @Body() commonEnableDisableDto: CommonEnableDisableDto): Promise<Result> {
    commonEnableDisableDto.userId = userId;
    return await this.permissionsService.disable(commonEnableDisableDto);
  }

  @Post('sort')
  @ApiOperation({ summary: '权限排序' })
  async sort(@User('id') userId: number, @Body() commonSortDto: CommonSortDto): Promise<Result> {
    commonSortDto.userId = userId;
    return await this.permissionsService.sort(commonSortDto);
  }
}
