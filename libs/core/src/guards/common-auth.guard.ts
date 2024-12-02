import { Reflector } from '@nestjs/core';
import { Injectable, CanActivate, ExecutionContext, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiException } from '@weishour/core/exceptions';
import { COMMONAUAH } from '@weishour/core/constants';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { isNull } from 'lodash';

@Injectable()
export class CommonAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
  ) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // 是否验证授权
    const isVerify = this.reflector.get<boolean>(COMMONAUAH, context.getHandler());
    if (isVerify === false) return true;

    // 获取请求头里的访问令牌
    const request: Request = context.switchToHttp().getRequest();
    const authorization = request.headers.authorization || '';
    const accessToken = authorization.split(' ')[1];

    // 解析令牌载体
    const payload = this.jwtService.decode(accessToken);
    if (!isNull(payload)) {
      request['user'] = { id: payload['userId'] };
      return true;
    }

    throw new ApiException('无效的身份认证', HttpStatus.UNAUTHORIZED);
  }
}
