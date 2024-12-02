import { Module, Global } from '@nestjs/common';
import { ColorUtil, CommonUtil, CryptoUtil, FileUtil, RandomUtil, TimeUtil } from '@weishour/core/utils';

@Global()
@Module({
  providers: [ColorUtil, CommonUtil, CryptoUtil, FileUtil, RandomUtil, TimeUtil],
  exports: [ColorUtil, CommonUtil, CryptoUtil, FileUtil, RandomUtil, TimeUtil],
})
export class UtilsModule {}
