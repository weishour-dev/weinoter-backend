import { Controller, UseGuards, Get, Param, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DataStateArgs, Result } from '@weishour/core/interfaces';
import { User } from '@weishour/core/decorators';
import { JwtAuthGuard } from '@weishour/core/guards';
import { GetParam } from '@ws/common/interfaces';
import { CommonSortDto, CommonShowHiddenDto, CommonEnableDisableDto } from '@ws/common/dtos';
import { MenusService } from './menus.service';
import { MenuEntity } from './menu.entity';
import { AddMenuGridDto, EditMenuGridDto, DeleteMenuGridDto } from './dtos';

@ApiTags('菜单管理')
@UseGuards(JwtAuthGuard)
@Controller()
export class MenusController {
  constructor(private menusService: MenusService) {}

  @Get()
  @ApiOperation({ summary: '获取所有菜单' })
  async getAll(@Query() param: GetParam): Promise<Result> {
    return await this.menusService.getAll(param);
  }

  @Get('tree')
  @ApiOperation({ summary: '获取所有菜单(树状)' })
  async getAllTree(): Promise<Result> {
    return await this.menusService.getAllTree();
  }

  @Get('navigation')
  @ApiOperation({ summary: '获取导航数据' })
  async getNavigation(@User('username') username: string): Promise<Result> {
    return await this.menusService.getNavigation(username);
  }

  @Post('grid')
  @ApiOperation({ summary: '获取菜单表格数据' })
  async grid(@User('id') userId: number, @Body() dataStateArgs: DataStateArgs): Promise<Result> {
    return await this.menusService.getGrid(userId, dataStateArgs);
  }

  @Post('grid/add')
  @ApiOperation({ summary: '新增菜单表格数据' })
  async addGrid(@User('id') userId: number, @Body('value') addMenuGridDto: AddMenuGridDto): Promise<Result> {
    addMenuGridDto.userId = userId;
    return await this.menusService.addGrid(addMenuGridDto);
  }

  @Post('grid/edit')
  @ApiOperation({ summary: '修改菜单表格数据' })
  async editGrid(@User('id') userId: number, @Body('value') editMenuGridDto: EditMenuGridDto): Promise<Result> {
    editMenuGridDto.userId = userId;
    return await this.menusService.editGrid(editMenuGridDto);
  }

  @Post('grid/remove')
  @ApiOperation({ summary: '删除菜单表格数据' })
  async removeGrid(@User('id') userId: number, @Body() deleteMenuGridDto: DeleteMenuGridDto): Promise<Result> {
    deleteMenuGridDto.userId = userId;
    return await this.menusService.removeGrid(deleteMenuGridDto);
  }

  @Post('grid/batch')
  @ApiOperation({ summary: '批量菜单表格数据' })
  async batchGrid(@Body('deleted') deletedDatas: MenuEntity[]): Promise<Result> {
    return await this.menusService.batchRemoveGrid(deletedDatas);
  }

  @Post('show')
  @ApiOperation({ summary: '显示菜单表格数据' })
  async show(@User('id') userId: number, @Body() commonShowHiddenDto: CommonShowHiddenDto): Promise<Result> {
    commonShowHiddenDto.userId = userId;
    return await this.menusService.show(commonShowHiddenDto);
  }

  @Post('hidden')
  @ApiOperation({ summary: '隐藏菜单表格数据' })
  async hidden(@User('id') userId: number, @Body() commonShowHiddenDto: CommonShowHiddenDto): Promise<Result> {
    commonShowHiddenDto.userId = userId;
    return await this.menusService.hidden(commonShowHiddenDto);
  }

  @Post('enable')
  @ApiOperation({ summary: '启用菜单表格数据' })
  async enable(@User('id') userId: number, @Body() commonEnableDisableDto: CommonEnableDisableDto): Promise<Result> {
    commonEnableDisableDto.userId = userId;
    return await this.menusService.enable(commonEnableDisableDto);
  }

  @Post('disable')
  @ApiOperation({ summary: '禁用菜单表格数据' })
  async disable(@User('id') userId: number, @Body() commonEnableDisableDto: CommonEnableDisableDto): Promise<Result> {
    commonEnableDisableDto.userId = userId;
    return await this.menusService.disable(commonEnableDisableDto);
  }

  @Post('sort')
  @ApiOperation({ summary: '菜单排序' })
  async sort(@User('id') userId: number, @Body() commonSortDto: CommonSortDto): Promise<Result> {
    commonSortDto.userId = userId;
    return await this.menusService.sort(commonSortDto);
  }

  @Get('parent')
  @ApiOperation({ summary: '获取上级菜单数据' })
  async parent(): Promise<Result> {
    return await this.menusService.parent();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取单个菜单' })
  async get(@Param('id') id: string): Promise<Result> {
    return await this.menusService.getOne(id);
  }
}
