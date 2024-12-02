import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNotEmpty, IsNumber, IsArray } from 'class-validator';

export class RemoveRoleDto {
  @ApiProperty({ description: '操作人id' })
  @IsNumber({}, { message: 'operatorId 必须是一个符合指定约束条件的数字' })
  @IsOptional()
  operatorId: number;

  @ApiProperty({ description: '用户id' })
  @IsNumber({}, { message: 'userIds 必须是一个符合指定约束条件的数字', each: true })
  @IsArray({ message: 'userIds 必须是一个数组' })
  @IsNotEmpty({ message: 'userIds 不能为空' })
  readonly userIds: number[];

  @ApiProperty({ description: '角色id' })
  @IsNumber({}, { message: 'roleId 必须是一个符合指定约束条件的数字' })
  @IsNotEmpty({ message: 'roleId 不能为空' })
  readonly roleId: number;
}
