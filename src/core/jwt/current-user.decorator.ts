import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserInfo } from '../../auth/models/user-info';

export const CurrentUser = createParamDecorator<
  unknown,
  ExecutionContext,
  UserInfo
>((data: unknown, context: ExecutionContext) => {
  const ctx = context.switchToHttp().getRequest();
  return ctx.user;
});
