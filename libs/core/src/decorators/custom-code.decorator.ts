import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { CUSTOMCODE } from '@weishour/core/constants';
import { CustomCodeGuard } from '@weishour/core/guards';
import { CustomCodeOptions } from '@weishour/core/interfaces';

export function CustomCode(customOption?: CustomCodeOptions) {
  return applyDecorators(SetMetadata(CUSTOMCODE, customOption), UseGuards(CustomCodeGuard));
}
