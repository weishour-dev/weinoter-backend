import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoreModule } from '@weishour/core';
import { RbacService } from '@ws/common/services';
import { MandatesModule } from '@ws/app/systems/mandates/mandates.module';
import { PermissionsController } from './permissions.controller';
import { PermissionsService } from './permissions.service';
import { PermissionEntity } from './permission.entity';
import { PermissionSubscriber } from './permission.subscriber';

@Module({
  imports: [CoreModule, TypeOrmModule.forFeature([PermissionEntity]), forwardRef(() => MandatesModule)],
  controllers: [PermissionsController],
  providers: [RbacService, PermissionsService, PermissionSubscriber],
  exports: [PermissionsService],
})
export class PermissionsModule {}
