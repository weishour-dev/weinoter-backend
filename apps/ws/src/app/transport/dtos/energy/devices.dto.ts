import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsNotEmpty, IsString, IsArray } from 'class-validator';

export class EnergyDevicesDto {
  @ApiProperty({ description: '用户id' })
  @IsNumber({}, { message: 'userId 必须是一个符合指定约束条件的数字' })
  @IsOptional()
  userId: number;

  @ApiProperty({ description: '资产编号' })
  @IsNumber({}, { message: 'terminalCode 必须是一个符合指定约束条件的数字' })
  @IsNotEmpty({ message: 'terminalCode 不能为空' })
  readonly terminalCode: number;

  @ApiProperty({ description: '设备ids' })
  @IsNumber({}, { message: 'deviceId 必须是一个符合指定约束条件的数字', each: true })
  @IsArray({ message: 'deviceIds 必须是一个数组' })
  @IsNotEmpty({ message: 'deviceIds 不能为空' })
  readonly deviceIds: number[];

  @ApiProperty({ description: '开始时间' })
  @IsString({ message: 'startTime 必须是一个字符串' })
  @IsOptional()
  readonly startTime: string;

  @ApiProperty({ description: '结束时间' })
  @IsString({ message: 'endTime 必须是一个字符串' })
  @IsOptional()
  readonly endTime: string;
}
