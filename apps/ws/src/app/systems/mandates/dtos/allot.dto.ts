import { ApiProperty } from '@nestjs/swagger';
import { ResourceItem } from '@ws/common/interfaces';
import { IsOptional, IsNotEmpty, IsNumber, IsArray, IsString } from 'class-validator';

export class AllotMandateDto {
  @ApiProperty({ description: '操作人id' })
  @IsNumber({}, { message: 'operatorId 必须是一个符合指定约束条件的数字' })
  @IsOptional()
  operatorId: number;

  @ApiProperty({ description: '目标对象类型' })
  @IsString({ message: 'targetType 必须是一个字符串' })
  @IsNotEmpty({ message: 'targetType 不能为空' })
  readonly targetType: string;

  @ApiProperty({ description: '目标对象id' })
  @IsNumber({}, { message: 'targetId 必须是一个符合指定约束条件的数字' })
  @IsNotEmpty({ message: 'targetId 不能为空' })
  readonly targetId: number;

  @ApiProperty({ description: '权限ids' })
  @IsNumber({}, { message: 'permissionId 必须是一个符合指定约束条件的数字', each: true })
  @IsArray({ message: 'permissionIds 必须是一个数组' })
  @IsNotEmpty({ message: 'permissionIds 不能为空' })
  @IsOptional()
  readonly permissionIds: number[];

  @ApiProperty({ description: '资源列表' })
  @IsArray({ message: 'resources 必须是一个数组' })
  @IsNotEmpty({ message: 'resources 不能为空' })
  @IsOptional()
  readonly resources: ResourceItem[];
}
