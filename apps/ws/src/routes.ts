import { Routes } from '@nestjs/core/router';
import { AuthModule } from '@ws/app/auth/auth.module';
import { FilesModule } from '@ws/app/files/files.module';
import { QweatherModule } from '@ws/app/platforms/qweather/qweather.module';
import { TransportModule } from '@ws/app/transport/transport.module';
import { MenusModule } from '@ws/app/systems/menus/menus.module';
import { OrganizationsModule } from '@ws/app/systems/organizations/organizations.module';
import { DepartmentsModule } from '@ws/app/systems/departments/departments.module';
import { RolesModule } from '@ws/app/systems/roles/roles.module';
import { MandatesModule } from '@ws/app/systems/mandates/mandates.module';
import { PermissionsModule } from '@ws/app/systems/permissions/permissions.module';
import { UserGroupsModule } from '@ws/app/systems/user-groups/user-groups.module';
import { UsersModule } from '@ws/app/systems/users/users.module';

export const routes: Routes = [
  {
    path: '/auth',
    module: AuthModule,
  },
  {
    path: '/files',
    module: FilesModule,
  },
  {
    path: '/platforms',
    children: [
      {
        path: '/qweather',
        module: QweatherModule,
      },
    ],
  },
  {
    path: '/transport',
    module: TransportModule,
  },
  {
    path: '/basedata',
    children: [],
  },
  {
    path: '/systems',
    children: [
      {
        path: '/menus',
        module: MenusModule,
      },
      {
        path: '/users',
        module: UsersModule,
      },
      {
        path: '/roles',
        module: RolesModule,
      },
      {
        path: '/mandates',
        module: MandatesModule,
      },
      {
        path: '/permissions',
        module: PermissionsModule,
      },
      {
        path: '/organizations',
        module: OrganizationsModule,
      },
      {
        path: '/departments',
        module: DepartmentsModule,
      },
      {
        path: '/user-groups',
        module: UserGroupsModule,
      },
    ],
  },
];
