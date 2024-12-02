import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AttachmentsDto {
  @ApiProperty({ description: '操作人id' })
  @IsNumber({}, { message: 'operatorId 必须是一个符合指定约束条件的数字' })
  @IsOptional()
  operatorId: number;

  @ApiProperty({ description: '单据实体名称' })
  @IsString({ message: 'entity 必须是一个字符串' })
  @IsNotEmpty({ message: 'entity 不能为空' })
  readonly entity: string;

  @ApiProperty({ description: '单据id' })
  @IsNumber({}, { message: 'orderId 必须是一个符合指定约束条件的数字' })
  @IsNotEmpty({ message: 'orderId 不能为空' })
  readonly orderId: number;
}
