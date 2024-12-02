import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class ProfilePasswordDto {
  @ApiProperty({ description: '用户id' })
  @IsNumber({}, { message: 'userId 必须是一个符合指定约束条件的数字' })
  @IsOptional()
  userId: number;

  @ApiProperty({ description: '当前密码' })
  @IsString({ message: 'currentPassword 必须是一个字符串' })
  @IsNotEmpty({ message: 'currentPassword 不能为空' })
  readonly currentPassword: string;

  @ApiProperty({ description: '新密码' })
  @IsString({ message: 'newPassword 必须是一个字符串' })
  @IsNotEmpty({ message: 'newPassword 不能为空' })
  readonly newPassword: string;
}
