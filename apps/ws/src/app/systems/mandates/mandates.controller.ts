import { Controller, UseGuards, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DataStateArgs, Result } from '@weishour/core/interfaces';
import { User } from '@weishour/core/decorators';
import { JwtAuthGuard } from '@weishour/core/guards';
import { CommonSortDto, CommonEnableDisableDto } from '@ws/common/dtos';
import { MandatesService } from './mandates.service';
import { MandateEntity } from './mandate.entity';
import { AllotMandateDto, AddMandateGridDto, EditMandateGridDto, DeleteMandateGridDto } from './dtos';

@ApiTags('授权管理')
@UseGuards(JwtAuthGuard)
@Controller()
export class MandatesController {
  constructor(private mandatesService: MandatesService) {}

  @Post('grid')
  @ApiOperation({ summary: '获取授权表格数据' })
  async grid(@User('id') userId: number, @Body() dataStateArgs: DataStateArgs): Promise<Result> {
    return await this.mandatesService.getGrid(userId, dataStateArgs);
  }

  @Post('permissions')
  @ApiOperation({ summary: '获取目标对象权限列表' })
  async permissions(@User('id') operatorId: number, @Body() allotMandateDto: AllotMandateDto): Promise<Result> {
    allotMandateDto.operatorId = operatorId;
    return await this.mandatesService.permissions(allotMandateDto);
  }

  @Post('allot')
  @ApiOperation({ summary: '分配授权' })
  async setDepartments(@User('id') operatorId: number, @Body() allotMandateDto: AllotMandateDto): Promise<Result> {
    allotMandateDto.operatorId = operatorId;
    return await this.mandatesService.allot(allotMandateDto);
  }

  @Post('grid/add')
  @ApiOperation({ summary: '新增授权表格数据' })
  async addGrid(@User('id') userId: number, @Body('value') addMandateGridDto: AddMandateGridDto): Promise<Result> {
    addMandateGridDto.userId = userId;
    return await this.mandatesService.addGrid(addMandateGridDto);
  }

  @Post('grid/edit')
  @ApiOperation({ summary: '修改授权表格数据' })
  async editGrid(@User('id') userId: number, @Body('value') editMandateGridDto: EditMandateGridDto): Promise<Result> {
    editMandateGridDto.userId = userId;
    return await this.mandatesService.editGrid(editMandateGridDto);
  }

  @Post('grid/remove')
  @ApiOperation({ summary: '删除授权表格数据' })
  async removeGrid(@User('id') userId: number, @Body() deleteMandateGridDto: DeleteMandateGridDto): Promise<Result> {
    deleteMandateGridDto.userId = userId;
    return await this.mandatesService.removeGrid(deleteMandateGridDto);
  }

  @Post('grid/batch')
  @ApiOperation({ summary: '批量授权表格数据' })
  async batchGrid(@Body('deleted') deletedDatas: MandateEntity[]): Promise<Result> {
    return await this.mandatesService.batchRemoveGrid(deletedDatas);
  }

  @Post('enable')
  @ApiOperation({ summary: '启用授权表格数据' })
  async enable(@User('id') userId: number, @Body() commonEnableDisableDto: CommonEnableDisableDto): Promise<Result> {
    commonEnableDisableDto.userId = userId;
    return await this.mandatesService.enable(commonEnableDisableDto);
  }

  @Post('disable')
  @ApiOperation({ summary: '禁用授权表格数据' })
  async disable(@User('id') userId: number, @Body() commonEnableDisableDto: CommonEnableDisableDto): Promise<Result> {
    commonEnableDisableDto.userId = userId;
    return await this.mandatesService.disable(commonEnableDisableDto);
  }

  @Post('sort')
  @ApiOperation({ summary: '授权排序' })
  async sort(@User('id') userId: number, @Body() commonSortDto: CommonSortDto): Promise<Result> {
    commonSortDto.userId = userId;
    return await this.mandatesService.sort(commonSortDto);
  }
}
