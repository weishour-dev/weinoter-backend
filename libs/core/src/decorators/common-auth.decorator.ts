import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { CommonAuthGuard } from '@weishour/core/guards';
import { COMMONAUAH } from '@weishour/core/constants';

export function CommonAuth(isVerify = true) {
  return applyDecorators(SetMetadata(COMMONAUAH, isVerify), UseGuards(CommonAuthGuard));
}
