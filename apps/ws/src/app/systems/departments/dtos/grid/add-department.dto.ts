import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNotEmpty, IsString, IsNumber, IsBoolean } from 'class-validator';
import { DepartmentEntity } from '@ws/app/systems/departments/department.entity';

export class AddDepartmentGridDto {
  @ApiProperty({ description: '用户id' })
  @IsNumber({}, { message: 'userId 必须是一个符合指定约束条件的数字' })
  @IsOptional()
  userId?: number;

  @ApiProperty({ description: '上级部门' })
  @IsNumber({}, { message: 'parentId 必须是一个符合指定约束条件的数字' })
  @IsOptional()
  readonly parentId?: number;

  @ApiProperty({ description: '父级部门' })
  @IsOptional()
  parent?: DepartmentEntity;

  @ApiProperty({ description: '组织编号' })
  @IsString({ message: 'organizationCode 必须是一个字符串' })
  @IsOptional()
  organizationCode: string;

  @ApiProperty({ description: '编号' })
  @IsString({ message: 'code 必须是一个字符串' })
  @IsOptional()
  code: string;

  @ApiProperty({ description: '名称' })
  @IsString({ message: 'name 必须是一个字符串' })
  @IsNotEmpty({ message: 'name 不能为空' })
  readonly name: string;

  @ApiProperty({ description: '描述' })
  @IsString({ message: 'description 必须是一个字符串' })
  @IsOptional()
  readonly description: string;

  @ApiProperty({ description: '状态' })
  @IsBoolean({ message: 'status 必须是一个布尔值' })
  @IsOptional()
  status?: boolean;

  @ApiProperty({ description: '排序' })
  @IsNumber({}, { message: 'sort 必须是一个符合指定约束条件的数字' })
  @IsOptional()
  sort?: number;
}
