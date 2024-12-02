import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { WsConfigService } from '@weishour/core/services';
import { TokenPayload } from '@ws/common/interfaces';
import { UsersService } from '@ws/app/systems/users/users.service';
import { UserEntity } from '@ws/app/systems/users/user.entity';
import { Request } from 'express';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private wsConfigService: WsConfigService,
    private userService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: wsConfigService.jwtRefreshTokenSecret,
      passReqToCallback: true,
    });
  }

  async validate(request: Request, payload: TokenPayload): Promise<UserEntity> {
    const refreshToken = request.headers.authorization?.split(' ')[1];
    return this.userService.verifyRefreshToken(refreshToken, payload.userId);
  }
}
