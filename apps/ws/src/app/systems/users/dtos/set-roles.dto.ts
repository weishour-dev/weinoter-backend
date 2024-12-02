import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNotEmpty, IsNumber, IsArray } from 'class-validator';

export class SetRolesDto {
  @ApiProperty({ description: '操作人id' })
  @IsNumber({}, { message: 'operatorId 必须是一个符合指定约束条件的数字' })
  @IsOptional()
  operatorId: number;

  @ApiProperty({ description: '用户id' })
  @IsNumber({}, { message: 'userId 必须是一个符合指定约束条件的数字' })
  @IsNotEmpty({ message: 'userId 不能为空' })
  readonly userId: number;

  @ApiProperty({ description: '角色ids' })
  @IsNumber({}, { message: 'roleIds 必须是一个符合指定约束条件的数字', each: true })
  @IsArray({ message: 'roleIds 必须是一个数组' })
  @IsNotEmpty({ message: 'roleIds 不能为空' })
  readonly roleIds: number[];
}
