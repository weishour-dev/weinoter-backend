import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class EditMenuDto {
  @ApiProperty({ description: '用户id' })
  @IsNumber({}, { message: 'userId 必须是一个符合指定约束条件的数字' })
  @IsOptional()
  userId: number;

  @ApiProperty({ description: '类型' })
  @IsString({ message: 'type 必须是一个字符串' })
  @IsOptional()
  type = 'basic';

  @ApiProperty({ description: '菜单id' })
  @IsNumber({}, { message: 'id 必须是一个符合指定约束条件的数字' })
  readonly id: number;

  @ApiProperty({ description: '图标' })
  @IsString({ message: 'icon 必须是一个字符串' })
  @IsNotEmpty({ message: 'icon 不能为空' })
  readonly icon: string;

  @ApiProperty({ description: '标题' })
  @IsString({ message: 'title 必须是一个字符串' })
  @IsNotEmpty({ message: 'title 不能为空' })
  readonly title: string;
}
