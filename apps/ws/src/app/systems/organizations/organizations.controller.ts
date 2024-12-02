import { Controller, UseGuards, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DataStateArgs, Result } from '@weishour/core/interfaces';
import { User } from '@weishour/core/decorators';
import { JwtAuthGuard } from '@weishour/core/guards';
import { CommonSortDto, CommonEnableDisableDto } from '@ws/common/dtos';
import { OrganizationsService } from './organizations.service';
import { AddOrganizationGridDto, EditOrganizationGridDto, DeleteOrganizationGridDto } from './dtos';

@ApiTags('组织管理')
@UseGuards(JwtAuthGuard)
@Controller()
export class OrganizationsController {
  constructor(private organizationsService: OrganizationsService) {}

  @Post('grid')
  @ApiOperation({ summary: '获取组织表格数据' })
  async grid(@User('id') userId: number, @Body() dataStateArgs: DataStateArgs): Promise<Result> {
    return await this.organizationsService.getGrid(userId, dataStateArgs);
  }

  @Post('add')
  @ApiOperation({ summary: '新增组织' })
  async add(@User('id') userId: number, @Body() addOrganizationGridDto: AddOrganizationGridDto): Promise<Result> {
    addOrganizationGridDto.userId = userId;
    return await this.organizationsService.add(addOrganizationGridDto);
  }

  @Post('edit')
  @ApiOperation({ summary: '修改组织表格数据' })
  async edit(@User('id') userId: number, @Body() editOrganizationGridDto: EditOrganizationGridDto): Promise<Result> {
    editOrganizationGridDto.userId = userId;
    return await this.organizationsService.edit(editOrganizationGridDto);
  }

  @Post('remove')
  @ApiOperation({ summary: '删除组织数据' })
  async remove(
    @User('id') userId: number,
    @Body() deleteOrganizationGridDto: DeleteOrganizationGridDto,
  ): Promise<Result> {
    deleteOrganizationGridDto.userId = userId;
    return await this.organizationsService.remove(deleteOrganizationGridDto);
  }

  @Post('enable')
  @ApiOperation({ summary: '启用组织表格数据' })
  async enable(@User('id') userId: number, @Body() commonEnableDisableDto: CommonEnableDisableDto): Promise<Result> {
    commonEnableDisableDto.userId = userId;
    return await this.organizationsService.enable(commonEnableDisableDto);
  }

  @Post('disable')
  @ApiOperation({ summary: '禁用组织表格数据' })
  async disable(@User('id') userId: number, @Body() commonEnableDisableDto: CommonEnableDisableDto): Promise<Result> {
    commonEnableDisableDto.userId = userId;
    return await this.organizationsService.disable(commonEnableDisableDto);
  }

  @Post('sort')
  @ApiOperation({ summary: '组织排序' })
  async sort(@User('id') userId: number, @Body() commonSortDto: CommonSortDto): Promise<Result> {
    commonSortDto.userId = userId;
    return await this.organizationsService.sort(commonSortDto);
  }
}
