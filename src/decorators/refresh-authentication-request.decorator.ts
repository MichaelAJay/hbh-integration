import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IRefreshAuthenticationRequest } from 'src/api/interfaces';

/**
 * May be used for any routes which pass through the RefreshToken guard
 */
export const RefreshAuthenticationReq = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): IRefreshAuthenticationRequest => {
    const request = ctx.switchToHttp().getRequest();
    return request as IRefreshAuthenticationRequest;
  },
);
