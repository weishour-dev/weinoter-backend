import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNotEmpty, IsString, IsNumber, IsEmail } from 'class-validator';

export class ProfileAccountDto {
  @ApiProperty({ description: '用户id' })
  @IsNumber({}, { message: 'userId 必须是一个符合指定约束条件的数字' })
  @IsOptional()
  userId: number;

  @ApiProperty({ description: '用户名' })
  @IsString({ message: 'currentPassword 必须是一个字符串' })
  @IsNotEmpty({ message: 'currentPassword 不能为空' })
  readonly username: string;

  @ApiProperty({ description: '昵称' })
  @IsString({ message: 'nickname 必须是一个字符串' })
  @IsOptional()
  readonly nickname: string;

  @ApiProperty({ description: '邮箱' })
  @IsEmail({}, { message: 'email 必须是正确的邮箱格式' })
  @IsString({ message: 'email 必须是一个字符串' })
  @IsNotEmpty({ message: 'email 不能为空' })
  readonly email: string;

  @ApiProperty({ description: '关于我' })
  @IsString({ message: 'about 必须是一个字符串' })
  @IsOptional()
  readonly about: string;
}
