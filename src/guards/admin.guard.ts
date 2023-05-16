import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthService } from 'src/internal-modules/auth/auth.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (process.env.ENV !== 'local') return false;

    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers['authorization'];
    const atToken = authHeader.split(' ')[1];

    if (!atToken) throw new BadRequestException({ reason: 'INVALID_HEADERS' });

    const { ADMIN_ID } = process.env;
    if (!ADMIN_ID)
      throw new InternalServerErrorException({ reason: 'BAD_CONFIG' });

    const { userId } = await this.authService.verifyAuthToken(atToken);

    return userId === ADMIN_ID;
  }
}
