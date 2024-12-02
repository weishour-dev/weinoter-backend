import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { WsConfigService } from '@weishour/core/services';
import { TokenPayload } from '@ws/common/interfaces';
import { UsersService } from '@ws/app/systems/users/users.service';
import { UserEntity } from '@ws/app/systems/users/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private wsConfigService: WsConfigService,
    private userService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: wsConfigService.jwtSecret,
    });
  }

  async validate(payload: TokenPayload): Promise<UserEntity> {
    return this.userService.verifyToken(payload);
  }
}
