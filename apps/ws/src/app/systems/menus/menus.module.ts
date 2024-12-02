import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoreModule } from '@weishour/core';
import { RbacService } from '@ws/common/services';
import { MandatesModule } from '@ws/app/systems/mandates/mandates.module';
import { PermissionsModule } from '@ws/app/systems/permissions/permissions.module';
import { MenusController } from './menus.controller';
import { MenusService } from './menus.service';
import { MenuEntity } from './menu.entity';
import { MenuSubscriber } from './menu.subscriber';

@Module({
  imports: [
    CoreModule,
    TypeOrmModule.forFeature([MenuEntity]),
    forwardRef(() => MandatesModule),
    forwardRef(() => PermissionsModule),
  ],
  controllers: [MenusController],
  providers: [RbacService, MenusService, MenuSubscriber],
  exports: [MenusService],
})
export class MenusModule {}
