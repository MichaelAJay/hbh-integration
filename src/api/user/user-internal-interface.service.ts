import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { AuthService } from 'src/internal-modules/auth/auth.service';
import { AccountDbHandlerService } from 'src/internal-modules/external-interface-handlers/database/account-db-handler/account-db-handler.service';
import { UserDbHandlerService } from 'src/internal-modules/external-interface-handlers/database/user-db-handler/user-db-handler.service';
import { IClaimAccount } from './interfaces';
import { ILogin } from './interfaces/login.interface';

@Injectable()
export class UserInternalInterfaceService {
  constructor(
    private readonly userDbHandler: UserDbHandlerService,
    private readonly accountDbHandler: AccountDbHandlerService,
    private readonly authService: AuthService,
  ) {}

  async login({ username: email, password }: ILogin) {
    const {
      id: userId,
      hashedPassword,
      salt,
      accountId,
    } = await this.userDbHandler.getOneByEmail(email);

    const account = await this.accountDbHandler.getAccount(accountId);
    if (!account)
      throw new UnprocessableEntityException('Could not find account');

    /**
     * If no return, then throw BadRequest
     */
    if (!hashedPassword) throw new BadRequestException('No match');

    await this.authService.hashedValueGate({
      hashedValue: hashedPassword,
      valueToHash: password,
      salt,
    });

    return await this.getAuthTokens({
      userId,
      salt,
      accountId,
      ref: account.ref,
    });
  }

  async refreshAuth({ userId, rt }: { userId: string; rt: string }) {
    const user = await this.userDbHandler.getOne(userId);
    if (!user.hashedRt) throw new ForbiddenException({ reason: 'NO_RT' });

    await this.authService.hashedValueGate({
      hashedValue: user.hashedRt,
      valueToHash: rt,
      salt: user.salt,
    });

    const account = await this.accountDbHandler.getAccount(user.accountId);
    if (!account)
      throw new UnprocessableEntityException('Account not found for user');

    return await this.getAuthTokens({
      userId,
      salt: user.salt,
      accountId: user.accountId,
      ref: account.ref,
    });
  }

  async claimAccount({ token, newPassword }: IClaimAccount) {
    const { userId, password } = await this.authService.verifyAcctToken(token);

    const user = await this.userDbHandler.getOne(userId);

    await this.authService.hashedValueGate({
      hashedValue: user.hashedPassword,
      valueToHash: password,
      salt: user.salt,
    });

    const newHashedPassword = await this.authService.hashValue({
      value: newPassword,
      salt: user.salt,
    });

    await this.userDbHandler.updateOne({
      userId,
      updates: { hashedPassword: newHashedPassword },
    });

    return;
  }

  /**
   * Gets auth & refresh token and updates user record with new hashedRt
   */
  private async getAuthTokens({
    userId,
    salt,
    accountId,
    ref,
  }: {
    userId: string;
    salt: string;
    accountId: string;
    ref: string;
  }) {
    const [at, rt] = await Promise.all([
      this.authService.signAuthToken({
        userId,
        accountId,
        ref: ref,
      }),
      this.authService.signRefreshToken({ userId }),
    ]);

    const hashedRt = await this.authService.hashValue({
      value: rt,
      salt,
    });

    await this.userDbHandler.updateOne({ userId, updates: { hashedRt } });
    return { at, rt };
  }
}
