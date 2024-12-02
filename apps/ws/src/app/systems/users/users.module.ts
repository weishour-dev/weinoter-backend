import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoreModule } from '@weishour/core';
import { RbacService } from '@ws/common/services';
import { DepartmentsModule } from '@ws/app/systems/departments/departments.module';
import { RolesModule } from '@ws/app/systems/roles/roles.module';
import { UserGroupsModule } from '@ws/app/systems/user-groups/user-groups.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserEntity } from './user.entity';
import { UserSubscriber } from './user.subscriber';

@Module({
  imports: [
    CoreModule,
    TypeOrmModule.forFeature([UserEntity]),
    forwardRef(() => DepartmentsModule),
    forwardRef(() => RolesModule),
    forwardRef(() => UserGroupsModule),
  ],
  controllers: [UsersController],
  providers: [RbacService, UsersService, UserSubscriber],
  exports: [UsersService],
})
export class UsersModule {}
