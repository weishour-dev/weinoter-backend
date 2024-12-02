import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNotEmpty, IsNumber, IsArray } from 'class-validator';

export class SetGroupsDto {
  @ApiProperty({ description: '操作人id' })
  @IsNumber({}, { message: 'operatorId 必须是一个符合指定约束条件的数字' })
  @IsOptional()
  operatorId: number;

  @ApiProperty({ description: '用户id' })
  @IsNumber({}, { message: 'userId 必须是一个符合指定约束条件的数字' })
  @IsNotEmpty({ message: 'userId 不能为空' })
  readonly userId: number;

  @ApiProperty({ description: '用户组ids' })
  @IsNumber({}, { message: 'groupIds 必须是一个符合指定约束条件的数字', each: true })
  @IsArray({ message: 'groupIds 必须是一个数组' })
  @IsNotEmpty({ message: 'groupIds 不能为空' })
  readonly groupIds: number[];
}
