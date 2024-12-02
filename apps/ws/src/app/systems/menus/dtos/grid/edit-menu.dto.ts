import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNotEmpty, IsString, IsNumber, IsBoolean } from 'class-validator';
import { MenuEntity } from '@ws/app/systems/menus/menu.entity';

export class EditMenuGridDto {
  @ApiProperty({ description: '上级菜单' })
  @IsNumber({}, { message: 'parentId 必须是一个符合指定约束条件的数字' })
  @IsOptional()
  readonly parentId: number;

  @ApiProperty({ description: '父级菜单' })
  @IsOptional()
  parent: MenuEntity;

  @ApiProperty({ description: '用户id' })
  @IsNumber({}, { message: 'userId 必须是一个符合指定约束条件的数字' })
  @IsOptional()
  userId: number;

  @ApiProperty({ description: '菜单id' })
  @IsNumber({}, { message: 'id 必须是一个符合指定约束条件的数字' })
  readonly id: number;

  @ApiProperty({ description: '类型' })
  @IsString({ message: 'type 必须是一个字符串' })
  @IsOptional()
  readonly type: string = 'basic';

  @ApiProperty({ description: '图标' })
  @IsString({ message: 'icon 必须是一个字符串' })
  @IsNotEmpty({ message: 'icon 不能为空' })
  readonly icon: string;

  @ApiProperty({ description: '标题' })
  @IsString({ message: 'title 必须是一个字符串' })
  @IsNotEmpty({ message: 'title 不能为空' })
  readonly title: string;

  @ApiProperty({ description: '国际化' })
  @IsString({ message: 'translation 必须是一个字符串' })
  @IsOptional()
  readonly translation: string;

  @ApiProperty({ description: '路由地址' })
  @IsString({ message: 'link 必须是一个字符串' })
  @IsOptional()
  readonly link: string;

  @ApiProperty({ description: '副标题' })
  @IsString({ message: 'subtitle 必须是一个字符串' })
  @IsOptional()
  subtitle: string;

  @ApiProperty({ description: '徽章' })
  @IsString({ message: 'badgeTitle 必须是一个字符串' })
  @IsOptional()
  badgeTitle: string;

  @ApiProperty({ description: '路由复用' })
  @IsBoolean({ message: 'reuse 必须是一个布尔值' })
  @IsOptional()
  reuse: boolean;

  @ApiProperty({ description: '标签关闭' })
  @IsBoolean({ message: 'reuseCloseable 必须是一个布尔值' })
  @IsOptional()
  reuseCloseable: boolean;

  @ApiProperty({ description: '隐藏' })
  @IsBoolean({ message: 'hidden 必须是一个布尔值' })
  @IsOptional()
  hidden: boolean;

  @ApiProperty({ description: '禁用' })
  @IsBoolean({ message: 'disabled 必须是一个布尔值' })
  @IsOptional()
  disabled: boolean;

  @ApiProperty({ description: '菜单层级' })
  @IsOptional()
  level: number;
}
