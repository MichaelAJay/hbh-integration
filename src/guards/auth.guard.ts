import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from 'src/internal-modules/auth/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const isPublic = this.reflector.getAllAndOverride('isPublic', [
        context.getHandler(),
        context.getClass(),
      ]);
      if (isPublic) return true;

      const req = context.switchToHttp().getRequest();
      const authHeader = req.headers['authorization'];
      const atToken = authHeader.split(' ')[1];

      const { accountId, userId, ref } = await this.authService.verifyAuthToken(
        atToken,
      );

      /**
       * Must satisfy IAuthenticatedRequest interface
       */
      req.accountId = accountId;
      req.userId = userId;
      req.ref = ref;

      return true;
    } catch (err) {
      return false;
    }
  }
}
