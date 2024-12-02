import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsArray } from 'class-validator';

export class DeleteRoleGridDto {
  @ApiProperty({ description: '用户id' })
  @IsNumber({}, { message: 'userId 必须是一个符合指定约束条件的数字' })
  @IsOptional()
  userId: number;

  @ApiProperty({ description: '角色id' })
  @IsNumber({}, { message: 'key 必须是一个符合指定约束条件的数字' })
  @IsOptional()
  readonly key: number;

  @ApiProperty({ description: '角色id' })
  @IsNumber({}, { message: 'id 必须是一个符合指定约束条件的数字' })
  @IsOptional()
  readonly id: number;

  @ApiProperty({ description: '角色ids' })
  @IsNumber({}, { message: 'id 必须是一个符合指定约束条件的数字', each: true })
  @IsArray({ message: 'ids 必须是一个数组' })
  @IsOptional()
  readonly ids: number[];
}
