import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IAuthenticatedRequest } from 'src/api/interfaces';

/**
 * May be used for any routes which pass through the standard AuthGuard
 */
export const AuthenticatedReq = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): IAuthenticatedRequest => {
    const request = ctx.switchToHttp().getRequest();
    return request as IAuthenticatedRequest;
  },
);
