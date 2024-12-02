import { Module } from '@nestjs/common';
import { MenusModule } from '@ws/app/systems/menus/menus.module';
import { UsersModule } from '@ws/app/systems/users/users.module';
import { RolesModule } from '@ws/app/systems/roles/roles.module';
import { MandatesModule } from '@ws/app/systems/mandates/mandates.module';
import { PermissionsModule } from '@ws/app/systems/permissions/permissions.module';
import { OrganizationsModule } from '@ws/app/systems/organizations/organizations.module';
import { DepartmentsModule } from '@ws/app/systems/departments/departments.module';
import { UserGroupsModule } from '@ws/app/systems/user-groups/user-groups.module';

@Module({
  imports: [
    MenusModule,
    UsersModule,
    RolesModule,
    MandatesModule,
    PermissionsModule,
    OrganizationsModule,
    DepartmentsModule,
    UserGroupsModule,
  ],
  exports: [
    MenusModule,
    UsersModule,
    RolesModule,
    MandatesModule,
    PermissionsModule,
    OrganizationsModule,
    DepartmentsModule,
    UserGroupsModule,
  ],
})
export class SystemsModule {}
