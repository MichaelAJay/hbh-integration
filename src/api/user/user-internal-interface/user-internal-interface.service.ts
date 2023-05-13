import { BadRequestException, Injectable } from '@nestjs/common';
import { AuthService } from 'src/internal-modules/auth/auth.service';
import { UserDbHandlerService } from 'src/internal-modules/external-interface-handlers/database/user-db-handler/user-db-handler.service';
import { ILogin } from '../interfaces/login.interface';

@Injectable()
export class UserInternalInterfaceService {
  constructor(
    private readonly userDbHandler: UserDbHandlerService,
    private readonly authService: AuthService,
  ) {}
  async login({ username: email, password }: ILogin) {
    const {
      id: userId,
      hashedPassword,
      salt,
      accountId,
    } = await this.userDbHandler.getOneByEmail(email);

    /**
     * If no return, then throw BadRequest
     */
    if (!hashedPassword) throw new BadRequestException('No match');

    await this.authService.hashedValueGate({
      hashedValue: hashedPassword,
      valueToHash: password,
      salt,
    });

    const at = await this.authService.signAuthToken({ userId, accountId });
    const rt = await this.authService.signRefreshToken({ userId });
    const hashedRt = await this.authService.hashValue({
      value: rt,
      salt,
    });

    await this.userDbHandler.updateOne({ userId, updates: { hashedRt } });
    return { at, rt };
  }
}
