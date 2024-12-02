import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class DeviceChartDto {
  @ApiProperty({ description: '资产编号' })
  @IsNumber({}, { message: 'terminalCode 必须是一个符合指定约束条件的数字' })
  @IsNotEmpty({ message: 'terminalCode 不能为空' })
  readonly terminalCode: number;

  @ApiProperty({ description: '分类' })
  @IsString({ message: 'classify 必须是一个字符串' })
  @IsNotEmpty({ message: 'classify 不能为空' })
  readonly classify: string;

  @ApiProperty({ description: '设备id' })
  @IsNumber({}, { message: 'deviceId 必须是一个符合指定约束条件的数字' })
  @IsNotEmpty({ message: 'deviceId 不能为空' })
  readonly deviceId: number;

  @ApiProperty({ description: '设备编号' })
  @IsNumber({}, { message: 'deviceCode 必须是一个符合指定约束条件的数字' })
  @IsNotEmpty({ message: 'deviceCode 不能为空' })
  readonly deviceCode: number;

  @ApiProperty({ description: '时间筛选模式' })
  @IsString({ message: 'timeFilterMode 必须是一个字符串' })
  @IsOptional()
  readonly timeFilterMode: string;

  @ApiProperty({ description: '开始时间' })
  @IsString({ message: 'startTime 必须是一个字符串' })
  readonly startTime: string;

  @ApiProperty({ description: '结束时间' })
  @IsString({ message: 'endTime 必须是一个字符串' })
  readonly endTime: string;
}
