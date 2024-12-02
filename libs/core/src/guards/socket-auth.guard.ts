import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Observable } from 'rxjs';
import { isNull } from 'lodash';

@Injectable()
export class SocketAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const accessToken = request.handshake.query?.Authorization;
    const payload = this.jwtService.decode(accessToken);

    if (!isNull(payload)) {
      request.handshake.query['userId'] = payload['userId'];
      return true;
    }

    throw new WsException('验证授权失败，加入ws服务失败！');
  }
}
