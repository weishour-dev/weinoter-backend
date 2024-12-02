import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const MenuId = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const menuId = request.method === 'GET' ? request.params['menuId'] : request.body['menuId'];
  return menuId;
});
