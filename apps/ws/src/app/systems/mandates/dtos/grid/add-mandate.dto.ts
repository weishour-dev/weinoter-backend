import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNotEmpty, IsString, IsNumber, IsBoolean } from 'class-validator';

export class AddMandateGridDto {
  @ApiProperty({ description: '用户id' })
  @IsNumber({}, { message: 'userId 必须是一个符合指定约束条件的数字' })
  @IsOptional()
  userId: number;

  @ApiProperty({ description: '编号' })
  @IsString({ message: 'code 必须是一个字符串' })
  @IsNotEmpty({ message: 'code 不能为空' })
  readonly code: string;

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
  status: boolean;

  @ApiProperty({ description: '排序' })
  @IsNumber({}, { message: 'sort 必须是一个符合指定约束条件的数字' })
  @IsOptional()
  sort: number;
}
