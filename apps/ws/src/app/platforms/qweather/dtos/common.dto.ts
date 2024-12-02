import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class QweatherCommonDto {
  @ApiPropertyOptional({ description: '用户认证key' })
  @IsString({ message: 'key 必须是一个字符串' })
  @IsOptional()
  key: string;

  @ApiPropertyOptional({ description: 'LocationID或者经纬度' })
  @IsString({ message: 'location 必须是一个字符串' })
  @IsOptional()
  location: string;

  @ApiPropertyOptional({ description: '语言' })
  @IsString({ message: 'lang 必须是一个字符串' })
  @IsOptional()
  lang: string;

  @ApiPropertyOptional({ description: '数据单位' })
  @IsString({ message: 'unit 必须是一个字符串' })
  @IsOptional()
  unit: string;
}
