import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsNotEmpty, IsString } from 'class-validator';

export class EnergyCostDeviceDto {
  @ApiProperty({ description: '用户id' })
  @IsNumber({}, { message: 'userId 必须是一个符合指定约束条件的数字' })
  @IsOptional()
  userId: number;

  @ApiProperty({ description: '资产编号' })
  @IsNumber({}, { message: 'terminalCode 必须是一个符合指定约束条件的数字' })
  @IsNotEmpty({ message: 'terminalCode 不能为空' })
  readonly terminalCode: number;

  @ApiProperty({ description: '设备id' })
  @IsNumber({}, { message: 'deviceId 必须是一个符合指定约束条件的数字' })
  @IsNotEmpty({ message: 'deviceId 不能为空' })
  readonly deviceId: number;

  @ApiProperty({ description: '设备变量' })
  @IsString({ message: 'variableIds 必须是一个字符串' })
  @IsNotEmpty({ message: 'variableIds 不能为空' })
  readonly variableIds: string;

  @ApiProperty({ description: '开始时间' })
  @IsString({ message: 'startTime 必须是一个字符串' })
  @IsOptional()
  readonly startTime: string;

  @ApiProperty({ description: '结束时间' })
  @IsString({ message: 'endTime 必须是一个字符串' })
  @IsOptional()
  readonly endTime: string;
}
