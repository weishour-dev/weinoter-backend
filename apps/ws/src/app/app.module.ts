import { Module } from '@nestjs/common';
import { RouterModule, APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { CoreModule } from '@weishour/core';
import { ValidationProvider } from '@weishour/core/providers';
import { routes } from '@ws/routes';
import { AuthModule } from '@ws/app/auth/auth.module';
import { FilesModule } from '@ws/app/files/files.module';
import { PlatformsModule } from '@ws/app/platforms/platforms.module';
import { TransportModule } from '@ws/app/transport/transport.module';
// import { BasedataModule } from '@ws/app/basedata/basedata.module';
import { SystemsModule } from '@ws/app/systems/systems.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    RouterModule.register(routes),
    CoreModule,
    AuthModule,
    FilesModule,
    PlatformsModule,
    TransportModule,
    // BasedataModule,
    SystemsModule,
  ],
  controllers: [AppController],
  providers: [
    ValidationProvider,
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
