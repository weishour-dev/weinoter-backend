import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsNotEmpty, IsString } from 'class-validator';

export class EnergyCostDto {
  @ApiProperty({ description: '用户id' })
  @IsNumber({}, { message: 'userId 必须是一个符合指定约束条件的数字' })
  @IsOptional()
  userId: number;

  @ApiProperty({ description: '资产id' })
  @IsNumber({}, { message: 'terminalId 必须是一个符合指定约束条件的数字' })
  @IsNotEmpty({ message: 'terminalId 不能为空' })
  readonly terminalId: number;

  @ApiProperty({ description: '开始时间' })
  @IsString({ message: 'startTime 必须是一个字符串' })
  @IsOptional()
  readonly startTime: string;

  @ApiProperty({ description: '结束时间' })
  @IsString({ message: 'endTime 必须是一个字符串' })
  @IsOptional()
  readonly endTime: string;
}
