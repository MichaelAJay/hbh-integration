import { Injectable } from '@nestjs/common';
import { ILogin } from './interfaces/login.interface';
import { UserInternalInterfaceService } from './user-internal-interface/user-internal-interface.service';

@Injectable()
export class UserService {
  constructor(
    private readonly userInternalInterface: UserInternalInterfaceService,
  ) {}

  async login(loginDto: ILogin) {
    return await this.userInternalInterface.login(loginDto);
  }
}
