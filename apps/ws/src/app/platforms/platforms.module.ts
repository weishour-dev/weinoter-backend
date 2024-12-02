import { Module } from '@nestjs/common';
import { QweatherModule } from '@ws/app/platforms/qweather/qweather.module';

@Module({
  imports: [QweatherModule],
  exports: [QweatherModule],
})
export class PlatformsModule {}
