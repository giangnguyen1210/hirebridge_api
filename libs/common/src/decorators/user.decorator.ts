import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserContext } from '../types/user-context';

export const User = createParamDecorator(
  (field: keyof UserContext | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return field ? request.user?.[field] : request.user;
  },
);