import { Injectable } from '@nestjs/common';
import { IResetPassword } from './interfaces';
import { ILogin } from './interfaces/login.interface';
import { UserInternalInterfaceService } from './user-internal-interface.service';

@Injectable()
export class UserService {
  constructor(
    private readonly userInternalInterface: UserInternalInterfaceService,
  ) {}

  async login(loginDto: ILogin) {
    return await this.userInternalInterface.login(loginDto);
  }

  async refreshAuth({ userId, rt }: { userId: string; rt: string }) {
    return await this.userInternalInterface.refreshAuth({ userId, rt });
  }

  async claimAccount(input: IResetPassword) {
    await this.userInternalInterface.resetPassword(input);
    return { msg: 'Account claimed.  You may log in with your new password' };
  }
}
