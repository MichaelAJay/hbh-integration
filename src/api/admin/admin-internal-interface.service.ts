import { Injectable } from '@nestjs/common';
import { AccountDbHandlerService } from 'src/internal-modules/external-interface-handlers/database/account-db-handler/account-db-handler.service';
import { UserDbHandlerService } from 'src/internal-modules/external-interface-handlers/database/user-db-handler/user-db-handler.service';
import { UserService } from 'src/internal-modules/user/user.service';
import { AdminCreateUserBodyDto } from './dtos/body';

@Injectable()
export class AdminInternalInterfaceService {
  constructor(
    private readonly accountDbHandler: AccountDbHandlerService,
    private readonly userDbHandler: UserDbHandlerService,
    private readonly userService: UserService,
  ) {}

  async createUser(body: AdminCreateUserBodyDto) {
    const { firstName, lastName, email, ref } = body;

    /**
     * @TODO this will need to handle null case
     */
    const { id: accountId } = await this.accountDbHandler.findByRef(ref);

    /**
     * Generate salt & temporary PW
     */
    const { password, hashedPassword, salt } =
      await this.userService.generateSaltAndHashedPassword();

    await this.userDbHandler.createOne({
      accountId,
      firstName,
      lastName,
      email,
      hashedPassword,
      salt,
    });

    /**
     * @TODO Send email.  Use password
     */
    return;
  }
}
