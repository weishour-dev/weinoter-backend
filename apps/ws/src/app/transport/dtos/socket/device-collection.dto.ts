import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class DeviceCollectionDto {
  @ApiProperty({ description: '资产id' })
  @IsNumber({}, { message: 'id 必须是一个符合指定约束条件的数字' })
  @IsNotEmpty({ message: 'id 不能为空' })
  readonly id: number;

  @ApiProperty({ description: '资产编号' })
  @IsNumber({}, { message: 'code 必须是一个符合指定约束条件的数字' })
  @IsNotEmpty({ message: 'code 不能为空' })
  readonly code: number;

  @ApiProperty({ description: '分类' })
  @IsString({ message: 'classify 必须是一个字符串' })
  @IsNotEmpty({ message: 'classify 不能为空' })
  @IsOptional()
  readonly classify: string;
}
