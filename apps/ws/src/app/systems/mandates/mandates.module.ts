import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoreModule } from '@weishour/core';
import { RbacService } from '@ws/common/services';
import { UsersModule } from '@ws/app/systems/users/users.module';
import { RolesModule } from '@ws/app/systems/roles/roles.module';
import { UserGroupsModule } from '@ws/app/systems/user-groups/user-groups.module';
import { DepartmentsModule } from '@ws/app/systems/departments/departments.module';
import { PermissionsModule } from '@ws/app/systems/permissions/permissions.module';
import { MandatesController } from './mandates.controller';
import { MandatesService } from './mandates.service';
import { MandateEntity } from './mandate.entity';
import { RoleSubscriber } from './mandate.subscriber';

@Module({
  imports: [
    CoreModule,
    TypeOrmModule.forFeature([MandateEntity]),
    forwardRef(() => UsersModule),
    forwardRef(() => RolesModule),
    forwardRef(() => UserGroupsModule),
    forwardRef(() => DepartmentsModule),
    forwardRef(() => PermissionsModule),
  ],
  controllers: [MandatesController],
  providers: [RbacService, MandatesService, RoleSubscriber],
  exports: [MandatesService],
})
export class MandatesModule {}
