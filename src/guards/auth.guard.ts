import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { AuthService } from 'src/modules/auth/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly authService: AuthService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    try {
      const isPublic = this.reflector.getAllAndOverride('isPublic', [
        context.getHandler(),
        context.getClass(),
      ]);
      if (isPublic) return true;

      const req = context.switchToHttp().getRequest();
      const authHeader = req.headers['authorization'];
      const atToken = authHeader.split(' ')[1];
      //   const user = this.auth.verifyJwt(atToken);
      //   if (!user) return false;
      //   req.user = user;
      return true;
    } catch (err) {
      return false;
    }
  }
}
