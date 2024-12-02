import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNotEmpty, IsNumber, IsArray, IsString } from 'class-validator';

export class BatchRemoveDto {
  @ApiProperty({ description: '操作人id' })
  @IsNumber({}, { message: 'operatorId 必须是一个符合指定约束条件的数字' })
  @IsOptional()
  operatorId: number;

  @ApiProperty({ description: '文件名称列表' })
  @IsString({ message: 'fileName 必须是一个字符串', each: true })
  @IsArray({ message: 'fileNames 必须是一个数组' })
  @IsNotEmpty({ message: 'fileNames 不能为空' })
  readonly fileNames: string[];
}
