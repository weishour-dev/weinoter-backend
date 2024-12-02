import { Request } from 'express';
import { UserEntity } from '@ws/app/systems/users/user.entity';

export interface RequestWithUser extends Request {
  user: UserEntity;
}
