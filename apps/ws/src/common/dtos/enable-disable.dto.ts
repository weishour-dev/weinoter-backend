import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNotEmpty, IsNumber, IsArray } from 'class-validator';

export class CommonEnableDisableDto {
  @ApiProperty({ description: '用户id' })
  @IsNumber({}, { message: 'userId 必须是一个符合指定约束条件的数字' })
  @IsOptional()
  userId: number;

  @ApiProperty({ description: 'ids' })
  @IsArray({ message: 'ids 必须是一个数组' })
  @IsNotEmpty({ message: 'ids 不能为空' })
  @IsOptional()
  readonly ids: Array<string | number>;

  @ApiProperty({ description: 'codes' })
  @IsArray({ message: 'codes 必须是一个数组' })
  @IsNotEmpty({ message: 'codes 不能为空' })
  @IsOptional()
  readonly codes: Array<string | number>;
}
