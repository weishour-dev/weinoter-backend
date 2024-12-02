import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DEFAULT_CONNECTION, MSSQL_CONNECTION } from '@weishour/core/constants';
import { TypeOrmConfigService, MssqlConfigService } from '@weishour/core/services';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      name: DEFAULT_CONNECTION,
      useClass: TypeOrmConfigService,
    }),
    // TypeOrmModule.forRootAsync({
    //   name: MSSQL_CONNECTION,
    //   useClass: MssqlConfigService,
    // }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
