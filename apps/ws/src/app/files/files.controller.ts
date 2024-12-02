import {
  UseGuards,
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Res,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { CommonAuthGuard } from '@weishour/core/guards';
import { CommonAuth, User } from '@weishour/core/decorators';
import { Result } from '@weishour/core/interfaces';
import { createReadStream } from 'fs';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { join, extname } from 'path';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { randomBytes } from 'crypto';
import { FilesService } from './files.service';
import { FileEntity } from './file.entity';
import { AttachmentsDto, BatchRemoveDto } from './dtos';
import * as querystring from 'querystring';

@ApiTags('文件管理')
@UseGuards(CommonAuthGuard)
@Controller()
export class FilesController {
  constructor(private filesService: FilesService) {}

  @Get(':fileName')
  @ApiOperation({ summary: '获取文件' })
  @SkipThrottle()
  @CommonAuth(false)
  async getFile(@Param('fileName') fileName: string, @Res() res: Response): Promise<void> {
    const fileEntity = await this.filesService.getOne(fileName);
    // 设置响应内容类型
    res.set({
      'Content-Type': fileEntity.mimeType,
      'Content-Length': fileEntity.size,
      'Content-Disposition': `inline; filename="${querystring.escape(fileEntity.originalName)}"`,
      'Access-Control-Expose-Headers': 'Content-Disposition',
    });

    createReadStream(join(process.cwd(), fileEntity.path)).pipe(res);
  }

  @Post('process')
  @ApiOperation({ summary: '文件上传' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: `${process.env.MULTER_DEST}/attachments`,
        filename: (req, file, callback) => {
          // 解决中文乱码问题
          file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
          const name = format(new Date(), 'yyyyMMddHHmmss', { locale: zhCN });
          const fileExtName = extname(file.originalname);
          const random = randomBytes(4).toString('hex').slice(0, 4);
          callback(null, `${name}${random}${fileExtName}`);
        },
      }),
    }),
  )
  async process(@User('id') userId: number, @Body() formData: any, @UploadedFile() file: Express.Multer.File) {
    // 存储文件信息
    const fileData = await this.filesService.upload(file, JSON.parse(formData.file));
    return { serverId: fileData.fileName };
  }

  @Delete('revert')
  @ApiOperation({ summary: '文件删除' })
  async revert(@Body() serverId: string): Promise<FileEntity> {
    // 删除文件信息
    const fileData = <FileEntity>await this.filesService.removeByName(serverId);
    return fileData;
  }

  @Post('attachments')
  @ApiOperation({ summary: '获取附件列表' })
  async getAttachments(@User('id') operatorId: number, @Body() attachmentsDto: AttachmentsDto): Promise<Result> {
    attachmentsDto.operatorId = operatorId;
    return await this.filesService.getAttachments(attachmentsDto);
  }

  @Post('batch/remove')
  @ApiOperation({ summary: '批量移除文件' })
  async batchRemove(@User('id') operatorId: number, @Body() batchRemoveDto: BatchRemoveDto): Promise<Result> {
    batchRemoveDto.operatorId = operatorId;
    return await this.filesService.batchRemove(batchRemoveDto);
  }
}
