import { Controller, UseGuards, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DataStateArgs, Result } from '@weishour/core/interfaces';
import { User } from '@weishour/core/decorators';
import { JwtAuthGuard } from '@weishour/core/guards';
import { GetParam } from '@ws/common/interfaces';
import { CommonSortDto, CommonEnableDisableDto } from '@ws/common/dtos';
import { DepartmentsService } from './departments.service';
import { AddDepartmentGridDto, EditDepartmentGridDto, DeleteDepartmentGridDto } from './dtos';

@ApiTags('部门管理')
@UseGuards(JwtAuthGuard)
@Controller()
export class DepartmentsController {
  constructor(private departmentsService: DepartmentsService) {}

  @Get()
  @ApiOperation({ summary: '获取所有部门' })
  async getAll(@Query() param: GetParam): Promise<Result> {
    return await this.departmentsService.getAll(param);
  }

  @Get('tree')
  @ApiOperation({ summary: '获取所有部门(树状)' })
  async getAllTree(): Promise<Result> {
    return await this.departmentsService.getAllTree();
  }

  @Get('parent')
  @ApiOperation({ summary: '获取上级部门数据' })
  async parent(): Promise<Result> {
    return await this.departmentsService.parent();
  }

  @Post('add')
  @ApiOperation({ summary: '新增部门数据' })
  async add(@User('id') userId: number, @Body() addDepartmentGridDto: AddDepartmentGridDto): Promise<Result> {
    addDepartmentGridDto.userId = userId;
    return await this.departmentsService.add(addDepartmentGridDto);
  }

  @Post('edit')
  @ApiOperation({ summary: '修改部门数据' })
  async edit(@User('id') userId: number, @Body() editDepartmentGridDto: EditDepartmentGridDto): Promise<Result> {
    editDepartmentGridDto.userId = userId;
    return await this.departmentsService.edit(editDepartmentGridDto);
  }

  @Post('remove')
  @ApiOperation({ summary: '删除部门数据' })
  async remove(@User('id') userId: number, @Body() deleteDepartmentGridDto: DeleteDepartmentGridDto): Promise<Result> {
    deleteDepartmentGridDto.userId = userId;
    return await this.departmentsService.remove(deleteDepartmentGridDto);
  }

  @Post('grid')
  @ApiOperation({ summary: '获取部门表格数据' })
  async grid(@User('id') userId: number, @Body() dataStateArgs: DataStateArgs): Promise<Result> {
    return await this.departmentsService.getGrid(userId, dataStateArgs);
  }

  @Post('enable')
  @ApiOperation({ summary: '启用部门表格数据' })
  async enable(@User('id') userId: number, @Body() commonEnableDisableDto: CommonEnableDisableDto): Promise<Result> {
    commonEnableDisableDto.userId = userId;
    return await this.departmentsService.enable(commonEnableDisableDto);
  }

  @Post('disable')
  @ApiOperation({ summary: '禁用部门表格数据' })
  async disable(@User('id') userId: number, @Body() commonEnableDisableDto: CommonEnableDisableDto): Promise<Result> {
    commonEnableDisableDto.userId = userId;
    return await this.departmentsService.disable(commonEnableDisableDto);
  }

  @Post('sort')
  @ApiOperation({ summary: '部门排序' })
  async sort(@User('id') userId: number, @Body() commonSortDto: CommonSortDto): Promise<Result> {
    commonSortDto.userId = userId;
    return await this.departmentsService.sort(commonSortDto);
  }
}
