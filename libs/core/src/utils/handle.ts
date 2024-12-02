import { HttpStatus } from '@nestjs/common';

/**
 * 成功返回
 * @param {string} message
 * @param {any} data
 */
export function success<T = any>(message: string, data?: T) {
  return { code: HttpStatus.OK, status: true, message, data };
}

/**
 * 错误返回
 * @param {string} message
 * @param {Error} error
 */
export function error(message: string, error?: Error) {
  return { code: HttpStatus.INTERNAL_SERVER_ERROR, status: false, message, error };
}
