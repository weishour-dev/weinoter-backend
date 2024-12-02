import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoreModule } from '@weishour/core';
import { RbacService } from '@ws/common/services';
import { UsersModule } from '@ws/app/systems/users/users.module';
import { MandatesModule } from '@ws/app/systems/mandates/mandates.module';
import { UserGroupsController } from './user-groups.controller';
import { UserGroupsService } from './user-groups.service';
import { UserGroupEntity } from './user-group.entity';
import { UserGroupSubscriber } from './user-group.subscriber';

@Module({
  imports: [
    CoreModule,
    TypeOrmModule.forFeature([UserGroupEntity]),
    forwardRef(() => UsersModule),
    forwardRef(() => MandatesModule),
  ],
  controllers: [UserGroupsController],
  providers: [RbacService, UserGroupsService, UserGroupSubscriber],
  exports: [UserGroupsService],
})
export class UserGroupsModule {}
