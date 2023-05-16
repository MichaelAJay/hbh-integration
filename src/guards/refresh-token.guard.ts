import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { AuthService } from 'src/internal-modules/auth/auth.service';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      if (process.env.ENV === 'local') return true;

      const req = context.switchToHttp().getRequest();

      /**
       * @CHECKED
       */
      if (!req.headers) {
        const msg = 'Request is missing headers';
        throw new BadRequestException(msg);
      }

      const authHeader = req.headers['authorization'];
      const rt = authHeader.split(' ')[1];

      const { userId } = await this.authService.verifyRefreshToken(rt);

      /**
       * Must satisfy IRefreshAuthenticationRequest interface
       */
      req.userId = userId;
      req.rt = rt;

      return true;
    } catch (err) {
      throw err;
    }
  }
}
