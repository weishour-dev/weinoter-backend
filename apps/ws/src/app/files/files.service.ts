import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository, In } from 'typeorm';
import { ApiException } from '@weishour/core/exceptions';
import { Result } from '@weishour/core/interfaces';
import { FileUtil, CommonUtil, success } from '@weishour/core/utils';
import { BaseService } from '@ws/common/services';
import { FileMetadata } from '@ws/common/interfaces';
import { FileEntity } from './file.entity';
import { AttachmentsDto, BatchRemoveDto } from './dtos';
import { pick, isUndefined, find } from 'lodash';
import { join } from 'path';

@Injectable()
export class FilesService extends BaseService<{ M: FileEntity }> {
  apiName = '文件';

  constructor(
    @InjectRepository(FileEntity) private fileRepository: Repository<FileEntity>,
    private fileUtil: FileUtil,
    commonUtil: CommonUtil,
  ) {
    super(fileRepository, commonUtil);
  }

  /**
   * 上传文件
   * @param {Express.Multer.File} fileData 文件信息
   * @param metadata 文件元数据
   * @return {Promise<Result>} result
   */
  async upload(fileData: Express.Multer.File, metadata: FileMetadata): Promise<FileEntity> {
    let file: FileEntity;

    try {
      const fileName = fileData.filename.split('.');
      const fileLike: DeepPartial<FileEntity> = {
        ...fileData,
        ...pick(metadata, ['type', 'sort']),
        orders: [],
        fieldName: fileData.fieldname,
        fileName: fileData.filename,
        fileType: fileName[1],
        mimeType: fileData.mimetype,
        originalName: fileData.originalname,
      };

      // 单据列表处理
      const entity = metadata.entity;
      const orderId = metadata.orderId;
      if (orderId > 0) fileLike.orders = [{ entity, ids: [orderId] }];

      file = await this.fileRepository.save<FileEntity>(this.fileRepository.create(fileLike));

      if (!fileData) throw new ApiException(`文件上传失败`, HttpStatus.NOT_IMPLEMENTED);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') throw new ApiException('文件已存在', HttpStatus.CONFLICT);
      throw new ApiException('发生了一些错误', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return file;
  }

  /**
   * 获取文件实体
   * @param {string} fileName
   * @returns {Promise<FileEntity>} file
   */
  async getOne(fileName: string): Promise<FileEntity> {
    const file = await this.fileRepository.findOneBy({ fileName });
    if (!file) throw new ApiException(`'${fileName}' 文件不存在`, HttpStatus.NOT_FOUND);

    return file;
  }

  /**
   * 获取附件列表
   * @param {AttachmentsDto} attachmentsDto
   * @returns {Promise<Result>}
   * @returns
   */
  async getAttachments(attachmentsDto: AttachmentsDto): Promise<Result> {
    const attachments: FileEntity[] = [];
    const entity = attachmentsDto.entity;
    const orderId = attachmentsDto.orderId;

    const files = await this.fileRepository
      .createQueryBuilder('file')
      .where('file.orders LIKE :entity', { entity: `%${entity}%` })
      .orderBy('file.sort', 'ASC')
      .getMany();

    for (const file of files) {
      const order = find(file.orders, ['entity', entity]);
      if (order.ids.includes(orderId)) attachments.push(file);
    }

    return success('获取附件列表成功', attachments);
  }

  /**
   * 批量移除文件
   * @param {BatchRemoveDto} batchRemoveDto
   * @returns {Promise<Result>}
   * @returns
   */
  async batchRemove(batchRemoveDto: BatchRemoveDto): Promise<Result> {
    const fileNames = batchRemoveDto.fileNames;

    // 删除文件实体以及文件
    const files = await this.removeByName(fileNames);

    return success('批量移除文件成功', files);
  }

  /**
   * 通过文件名称删除文件实体以及文件
   * @param {number | number[]} id
   * @returns {Promise<FileEntity | FileEntity[]>} file
   */
  async removeById(id: number | number[]): Promise<FileEntity | FileEntity[]> {
    if (typeof id === 'number') {
      const existing = await this.fileRepository.findOneBy({ id });
      if (!existing) throw new ApiException(`ID 为 '${id}' 文件不存在`, HttpStatus.NOT_FOUND);

      let file: FileEntity;
      try {
        file = await this.fileRepository.remove(existing);
      } catch (error) {
        throw new ApiException('发生了一些错误', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      if (isUndefined(file.id)) await this.fileUtil.unlink(join(process.cwd(), file.path));
      return file;
    } else {
      const existing = await this.fileRepository.findBy({ fileName: In(id) });
      if (!existing) throw new ApiException(`ID 为 '${id.join(',')}' 文件不存在`, HttpStatus.NOT_FOUND);

      let files: FileEntity[];
      try {
        files = await this.fileRepository.remove(existing);
      } catch (error) {
        throw new ApiException('发生了一些错误', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      for (const file of files) {
        if (isUndefined(file.id)) await this.fileUtil.unlink(join(process.cwd(), file.path));
      }

      return files;
    }
  }

  /**
   * 通过文件名称删除文件实体以及文件
   * @param {string | string[]} fileName
   * @returns {Promise<FileEntity | FileEntity[]>} file
   */
  async removeByName(fileName: string | string[]): Promise<FileEntity | FileEntity[]> {
    if (typeof fileName === 'string') {
      const existing = await this.fileRepository.findOneBy({ fileName });
      if (!existing) throw new ApiException(`'${fileName}' 文件不存在`, HttpStatus.NOT_FOUND);

      let file: FileEntity;
      try {
        file = await this.fileRepository.remove(existing);
      } catch (error) {
        throw new ApiException('发生了一些错误', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      if (isUndefined(file.id)) await this.fileUtil.unlink(join(process.cwd(), file.path));
      return file;
    } else {
      const existing = await this.fileRepository.findBy({ fileName: In(fileName) });
      if (!existing) throw new ApiException(`'${fileName.join(',')}' 文件不存在`, HttpStatus.NOT_FOUND);

      let files: FileEntity[];
      try {
        files = await this.fileRepository.remove(existing);
      } catch (error) {
        throw new ApiException('发生了一些错误', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      for (const file of files) {
        if (isUndefined(file.id)) await this.fileUtil.unlink(join(process.cwd(), file.path));
      }

      return files;
    }
  }
}
