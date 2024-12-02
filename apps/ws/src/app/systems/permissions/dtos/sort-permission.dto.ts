import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNotEmpty, IsNumber, IsArray } from 'class-validator';

export class SortPermissionDto {
  @ApiProperty({ description: '用户id' })
  @IsNumber({}, { message: 'userId 必须是一个符合指定约束条件的数字' })
  @IsOptional()
  userId: number;

  @ApiProperty({ description: '菜单id' })
  @IsNumber({}, { message: 'menuId 必须是一个符合指定约束条件的数字' })
  @IsNotEmpty({ message: 'menuId 不能为空' })
  readonly menuId: number;

  @ApiProperty({ description: '角色id' })
  @IsNumber({}, { message: 'ids 必须是一个符合指定约束条件的数字', each: true })
  @IsArray({ message: 'ids 必须是一个数组' })
  @IsNotEmpty({ message: 'ids 不能为空' })
  readonly ids: number[];
}
