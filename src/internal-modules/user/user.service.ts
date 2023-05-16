import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class UserService {
  constructor(private readonly authService: AuthService) {}
  async generateSaltAndHashedPassword(password?: string) {
    const salt = this.authService.createSalt();

    if (!password) {
      password = this.authService.generateRandomPassword();
    }

    const hashedPassword = await this.authService.hashValue({
      value: password,
      salt,
    });

    return { password, hashedPassword, salt };
  }
}
