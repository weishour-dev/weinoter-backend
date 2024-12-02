import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNotEmpty, IsNumber, IsArray } from 'class-validator';

export class SetDepartmentsDto {
  @ApiProperty({ description: '操作人id' })
  @IsNumber({}, { message: 'operatorId 必须是一个符合指定约束条件的数字' })
  @IsOptional()
  operatorId: number;

  @ApiProperty({ description: '用户id' })
  @IsNumber({}, { message: 'userId 必须是一个符合指定约束条件的数字' })
  @IsNotEmpty({ message: 'userId 不能为空' })
  readonly userId: number;

  @ApiProperty({ description: '部门ids' })
  @IsNumber({}, { message: 'departmentIds 必须是一个符合指定约束条件的数字', each: true })
  @IsArray({ message: 'departmentIds 必须是一个数组' })
  @IsNotEmpty({ message: 'departmentIds 不能为空' })
  readonly departmentIds: number[];
}
