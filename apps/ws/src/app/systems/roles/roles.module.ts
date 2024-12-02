import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoreModule } from '@weishour/core';
import { RbacService } from '@ws/common/services';
import { UsersModule } from '@ws/app/systems/users/users.module';
import { MandatesModule } from '@ws/app/systems/mandates/mandates.module';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { RoleEntity } from './role.entity';
import { RoleSubscriber } from './role.subscriber';

@Module({
  imports: [
    CoreModule,
    TypeOrmModule.forFeature([RoleEntity]),
    forwardRef(() => UsersModule),
    forwardRef(() => MandatesModule),
  ],
  controllers: [RolesController],
  providers: [RbacService, RolesService, RoleSubscriber],
  exports: [RolesService],
})
export class RolesModule {}
