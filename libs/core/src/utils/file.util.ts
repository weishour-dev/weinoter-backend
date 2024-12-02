import { Injectable } from '@nestjs/common';
import { parse, join, extname } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs, { PathLike } from 'fs';
import sharp from 'sharp';

@Injectable()
export class FileUtil {
  /**
   * 读取路径信息
   * @param {string} path 路径
   */
  async getStat(path: string): Promise<fs.Stats | boolean> {
    return new Promise(resolve => {
      fs.stat(path, (err, stats) => {
        if (err) {
          resolve(false);
        } else {
          resolve(stats);
        }
      });
    });
  }

  /**
   * 创建路径
   * @param {string} dir 路径
   */
  async mkdir(dir: string): Promise<boolean> {
    return new Promise(resolve => {
      fs.mkdir(dir, err => {
        if (err) {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }

  /**
   * 路径是否存在，不存在则创建
   * @param {string} dir 路径
   */
  async dirExists(dir: string): Promise<boolean> {
    const isExists = await this.getStat(dir);

    if (typeof isExists !== 'boolean') {
      //如果该路径且不是文件，返回true
      if (isExists && isExists.isDirectory()) {
        return true;
      } else if (isExists) {
        //如果该路径存在但是文件，返回false
        return false;
      }
    }

    //如果该路径不存在
    const tempDir = parse(dir).dir; //拿到上级路径
    //递归判断，如果上级目录也不存在，则会代码会在此处继续循环执行，直到目录存在
    const status = await this.dirExists(tempDir);
    let mkdirStatus: boolean;

    if (status) {
      mkdirStatus = await this.mkdir(dir);
    }
    return mkdirStatus;
  }

  /**
   * 删除文件
   * @param {PathLike} path 路径
   */
  async unlink(path: PathLike): Promise<boolean> {
    return new Promise(resolve => {
      fs.unlink(path, err => {
        if (err) {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }

  /**
   * 文件权限
   * @param {string} path 文件路径
   * @param {string} mode 读写权限
   */
  async chmod(path: string, mode = '0777'): Promise<boolean> {
    return new Promise(resolve => {
      fs.chmod(path, mode, err => {
        if (err) {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }

  /**
   * 读取TXT文件内容
   * @param {string} path 路径
   */
  async readFileTxtAsync(path: string): Promise<string> {
    return new Promise((resolve, reject) => {
      fs.readFile(path, 'utf-8', (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  /**
   * WAV文件大小
   * @param {string} path 路径
   */
  async getWavFileSize(path: string): Promise<number> {
    return new Promise((resolve, reject) => {
      fs.readFile(path, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data.length);
        }
      });
    });
  }

  /**
   * 转换视频并返回Buffer对象
   *
   * @param inputPath
   * @param outputPath
   */
  async convertVideo(inputPath: string, outputPath: string): Promise<Buffer> {
    const execPromise = promisify(exec);

    await this.unlink(outputPath);
    // 将webm格式视频转为mp4格式
    await execPromise(`ffmpeg -i ${inputPath} -c:v libx264 -c:a aac ${outputPath}`);

    // 读取文件为 Buffer
    const fileBuffer = await fs.promises.readFile(outputPath);

    return fileBuffer;
  }

  /**
   * 递归遍历目录转换图片为WebP格式
   * this.fileUtil.traverseDirectory(join(__dirname, '../../../public/resource'));
   */
  traverseDirectory = dir => {
    fs.readdir(dir, (err, files) => {
      if (err) {
        console.error(`读取目录错误: ${err}`);
        return;
      }

      files.forEach(file => {
        const filePath = join(dir, file);

        // 检查是否是文件夹
        fs.stat(filePath, (err, stats) => {
          if (err) {
            console.error(`获取文件状态错误: ${err}`);
            return;
          }

          if (stats.isDirectory()) {
            // 如果是文件夹，则递归遍历
            this.traverseDirectory(filePath);
          } else if (extname(file) === '.png') {
            // 如果是PNG文件，执行转换
            const outputFilePath = filePath.replace('.png', '.webp');

            sharp(filePath)
              .webp({
                quality: 50,      // 设置输出图片质量，范围 1-100，默认为 80
                alphaQuality: 80, // 控制透明度部分的质量（仅适用于透明图片），范围 0-100
                lossless: false,  // 是否使用无损压缩（true 表示无损压缩，false 表示有损压缩）
                nearLossless: false,  // 近无损压缩模式，范围 0-100，越接近 100 表示保留更多细节
                smartSubsample: true, // 是否启用智能子采样，能在降低图像质量的情况下保持良好效果
                effort: 6, // 代替 `compressionLevel`，范围 0-6，值越高文件越小但编码时间更长
              })
              .toFile(outputFilePath, (err, info) => {
                if (err) {
                  console.error(`转换为WebP失败: ${err}`);
                  return;
                }

                console.log(`转换成功: ${outputFilePath}`);

                // 转换成功后删除原始PNG文件
                fs.unlink(filePath, err => {
                  if (err) {
                    console.error(`删除PNG文件失败: ${err}`);
                  } else {
                    console.log(`已删除原始PNG文件: ${filePath}`);
                  }
                });
              });
          } else if (extname(file) === '.jpg' || extname(file) === '.jpeg') {
            // 如果是JPG或JPEG文件，执行转换
            const outputFilePath = filePath.replace(/\.jpe?g$/, '.webp');

            sharp(filePath)
              .webp({
                quality: 50,      // 设置输出图片质量，范围 1-100，默认为 80
                alphaQuality: 80, // 控制透明度部分的质量（仅适用于透明图片），范围 0-100
                lossless: false,  // 是否使用无损压缩（true 表示无损压缩，false 表示有损压缩）
                nearLossless: false,  // 近无损压缩模式，范围 0-100，越接近 100 表示保留更多细节
                smartSubsample: true, // 是否启用智能子采样，能在降低图像质量的情况下保持良好效果
                effort: 6, // 代替 `compressionLevel`，范围 0-6，值越高文件越小但编码时间更长
              })
              .toFile(outputFilePath, (err, info) => {
                if (err) {
                  console.error(`转换为WebP失败: ${err}`);
                  return;
                }

                console.log(`转换成功: ${outputFilePath}`);

                // 转换成功后删除原始JPG文件
                fs.unlink(filePath, err => {
                  if (err) {
                    console.error(`删除JPG文件失败: ${err}`);
                  } else {
                    console.log(`已删除原始JPG文件: ${filePath}`);
                  }
                });
              });
          } else if (extname(file) === '.JPG') {
            // 如果是JPG或JPEG文件，执行转换
            const outputFilePath = filePath.replace('.JPG', '.webp');

            sharp(filePath)
              .webp({
                quality: 50,      // 设置输出图片质量，范围 1-100，默认为 80
                alphaQuality: 80, // 控制透明度部分的质量（仅适用于透明图片），范围 0-100
                lossless: false,  // 是否使用无损压缩（true 表示无损压缩，false 表示有损压缩）
                nearLossless: false,  // 近无损压缩模式，范围 0-100，越接近 100 表示保留更多细节
                smartSubsample: true, // 是否启用智能子采样，能在降低图像质量的情况下保持良好效果
                effort: 6, // 代替 `compressionLevel`，范围 0-6，值越高文件越小但编码时间更长
              })
              .toFile(outputFilePath, (err, info) => {
                if (err) {
                  console.error(`转换为WebP失败: ${err}`);
                  return;
                }

                console.log(`转换成功: ${outputFilePath}`);

                // 转换成功后删除原始JPG文件
                fs.unlink(filePath, err => {
                  if (err) {
                    console.error(`删除JPG文件失败: ${err}`);
                  } else {
                    console.log(`已删除原始JPG文件: ${filePath}`);
                  }
                });
              });
          }
        });
      });
    });
  };
}
