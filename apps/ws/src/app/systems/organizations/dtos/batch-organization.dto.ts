import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNotEmpty, IsNumber, IsString, IsArray } from 'class-validator';

export class BatchOrganizationDto {
  @ApiProperty({ description: '用户id' })
  @IsNumber({}, { message: 'userId 必须是一个符合指定约束条件的数字' })
  @IsOptional()
  userId: number;

  @ApiProperty({ description: '组织codes' })
  @IsString({ message: 'code 必须是一个字符串', each: true })
  @IsArray({ message: 'codes 必须是一个数组' })
  @IsNotEmpty({ message: 'codes 不能为空' })
  readonly codes: string[];
}
