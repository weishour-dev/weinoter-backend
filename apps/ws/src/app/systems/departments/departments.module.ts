import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoreModule } from '@weishour/core';
import { RbacService } from '@ws/common/services';
import { UsersModule } from '@ws/app/systems/users/users.module';
import { MandatesModule } from '@ws/app/systems/mandates/mandates.module';
import { DepartmentsController } from './departments.controller';
import { DepartmentsService } from './departments.service';
import { DepartmentEntity } from './department.entity';
import { DepartmentSubscriber } from './department.subscriber';

@Module({
  imports: [
    CoreModule,
    TypeOrmModule.forFeature([DepartmentEntity]),
    forwardRef(() => UsersModule),
    forwardRef(() => MandatesModule),
  ],
  controllers: [DepartmentsController],
  providers: [RbacService, DepartmentsService, DepartmentSubscriber],
  exports: [DepartmentsService],
})
export class DepartmentsModule {}
