import { Reflector } from '@nestjs/core';
import { Injectable, CanActivate, ExecutionContext, HttpStatus } from '@nestjs/common';
import { CUSTOMCODE } from '@weishour/core/constants';
import { CustomCodeOptions } from '@weishour/core/interfaces';
import { ApiException } from '@weishour/core/exceptions';
import { RandomUtil } from '@weishour/core/utils';
import { Request } from 'express';

@Injectable()
export class CustomCodeGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private randomUtil: RandomUtil,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    // 自定义编号选项
    const customOption = this.reflector.get<CustomCodeOptions>(CUSTOMCODE, context.getHandler());

    // 获取请求body进行自定义编号赋值
    const request: Request = context.switchToHttp().getRequest();
    let body = request.body;
    let field = customOption?.field || 'code';
    if (customOption?.body) body = body[customOption.body];

    if (body[field] === undefined) {
      throw new ApiException(`『${field}』自定义编号字段未定义`, HttpStatus.NOT_IMPLEMENTED);
    } else {
      body[field] = this.randomUtil.customCode(customOption);
      return true;
    }
  }
}
