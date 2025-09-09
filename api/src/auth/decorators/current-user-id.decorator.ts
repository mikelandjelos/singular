import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { type Request } from 'express';

export const CurrentUserId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string | undefined => {
    const req = ctx
      .switchToHttp()
      .getRequest<Request & { user: { userId: string } }>();
    return req.user?.userId as string | undefined; // set by JwtStrategy.validate
  },
);
