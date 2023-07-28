import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import * as Sentry from '@sentry/node';

@Injectable()
export class UserService {
  constructor(private readonly authService: AuthService) {}
  async generateSaltAndHashedPassword(inputPassword?: string) {
    const salt = this.authService.createSalt();

    const password = inputPassword
      ? inputPassword
      : this.authService.generateRandomPassword();

    if (typeof password !== 'string') {
      const err = new InternalServerErrorException();
      Sentry.withScope((scope) => {
        scope.setExtra('password', password);
        Sentry.captureException(err);
      });
      throw err;
    }

    const hashedPassword = await this.authService.hashValue({
      value: password,
      salt,
    });

    return { password, hashedPassword, salt };
  }
}
