import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNotEmpty, IsNumber, IsArray } from 'class-validator';

export class RemoveDepartmentDto {
  @ApiProperty({ description: '操作人id' })
  @IsNumber({}, { message: 'operatorId 必须是一个符合指定约束条件的数字' })
  @IsOptional()
  operatorId: number;

  @ApiProperty({ description: '用户id' })
  @IsNumber({}, { message: 'userIds 必须是一个符合指定约束条件的数字', each: true })
  @IsArray({ message: 'userIds 必须是一个数组' })
  @IsNotEmpty({ message: 'userIds 不能为空' })
  readonly userIds: number[];

  @ApiProperty({ description: '部门id' })
  @IsNumber({}, { message: 'departmentId 必须是一个符合指定约束条件的数字' })
  @IsNotEmpty({ message: 'departmentId 不能为空' })
  readonly departmentId: number;
}
