import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { CasbinGuard, PERMISSION, WsPermission } from '@weishour/core/plugins/casbin';

export function Permission(permission?: WsPermission) {
  return applyDecorators(SetMetadata(PERMISSION, permission), UseGuards(CasbinGuard));
}
