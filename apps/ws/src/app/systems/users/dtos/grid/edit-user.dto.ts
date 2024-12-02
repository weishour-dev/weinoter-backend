import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNotEmpty, IsString, IsNumber, IsEmail } from 'class-validator';

export class EditUserGridDto {
  @ApiProperty({ description: '用户id' })
  @IsNumber({}, { message: 'userId 必须是一个符合指定约束条件的数字' })
  @IsOptional()
  userId: number;

  @ApiProperty({ description: '用户id' })
  @IsNumber({}, { message: 'id 必须是一个符合指定约束条件的数字' })
  readonly id: number;

  @ApiProperty({ description: '用户名' })
  @IsString({ message: 'username 必须是一个字符串' })
  @IsNotEmpty({ message: 'username 不能为空' })
  readonly username: string;

  @ApiProperty({ description: '密码' })
  @IsString({ message: 'password 必须是一个字符串' })
  @IsNotEmpty({ message: 'password 不能为空' })
  password: string;

  @ApiProperty({ description: '昵称' })
  @IsString({ message: 'nickname 必须是一个字符串' })
  @IsOptional()
  readonly nickname: string;

  @ApiProperty({ description: '邮箱' })
  @IsEmail({}, { message: 'email 必须是正确的邮箱格式' })
  @IsString({ message: 'email 必须是一个字符串' })
  @IsNotEmpty({ message: 'email 不能为空' })
  readonly email: string;
}
