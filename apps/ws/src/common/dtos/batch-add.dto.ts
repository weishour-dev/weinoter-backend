import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CommonBatchAddDto {
  @ApiProperty({ description: 'id' })
  @IsNumber({}, { message: 'id 必须是一个符合指定约束条件的数字' })
  @IsOptional()
  readonly id: number;

  @ApiProperty({ description: '资产id' })
  @IsNumber({}, { message: 'terminalId 必须是一个符合指定约束条件的数字' })
  @IsOptional()
  readonly terminalId: number;

  @ApiProperty({ description: '类型' })
  @IsString({ message: 'type 必须是一个字符串' })
  @IsOptional()
  readonly type: string;

  @ApiProperty({ description: '个数' })
  @IsNumber({}, { message: 'addCount 必须是一个符合指定约束条件的数字' })
  @IsNotEmpty({ message: 'addCount 不能为空' })
  readonly addCount: number;

  @ApiProperty({ description: '行数' })
  @IsNumber({}, { message: 'rowCount 必须是一个符合指定约束条件的数字' })
  @IsNotEmpty({ message: 'rowCount 不能为空' })
  readonly rowCount: number;
}
