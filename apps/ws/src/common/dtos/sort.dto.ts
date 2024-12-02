import { ApiProperty } from '@nestjs/swagger';
import { Order } from '@weishour/core/enums';
import { IsOptional, IsNotEmpty, IsNumber, IsArray, IsString, IsEnum } from 'class-validator';

export class CommonSortDto {
  @ApiProperty({ description: '用户id' })
  @IsNumber({}, { message: 'userId 必须是一个符合指定约束条件的数字' })
  @IsOptional()
  userId: number;

  @ApiProperty({ description: '类型条件字段' })
  @IsNotEmpty({ message: 'type 不能为空' })
  @IsOptional()
  readonly type: number | string;

  @ApiProperty({ description: '类型条件字段名称' })
  @IsString({ message: 'typeName 必须是一个字符串' })
  @IsNotEmpty({ message: 'typeName 不能为空' })
  @IsOptional()
  readonly typeName: string;

  @ApiProperty({ description: '主键id' })
  @IsArray({ message: 'ids 必须是一个数组' })
  @IsNotEmpty({ message: 'ids 不能为空' })
  readonly ids: Array<string | number>;

  @ApiProperty({ description: '默认排序' })
  @IsEnum(Order, { message: 'order 必须是一个有效的枚举值' })
  @IsNotEmpty({ message: 'order 不能为空' })
  @IsOptional()
  readonly order: 'ASC' | 'DESC';
}
