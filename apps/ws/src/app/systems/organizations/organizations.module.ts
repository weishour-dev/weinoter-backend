import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoreModule } from '@weishour/core';
import { QueryRunnerFactory } from '@weishour/core/factories';
import { DepartmentsModule } from '@ws/app/systems/departments/departments.module';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';
import { OrganizationEntity } from './organization.entity';

@Module({
  imports: [CoreModule, TypeOrmModule.forFeature([OrganizationEntity]), forwardRef(() => DepartmentsModule)],
  controllers: [OrganizationsController],
  providers: [QueryRunnerFactory, OrganizationsService],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}
