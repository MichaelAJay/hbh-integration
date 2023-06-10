import { Injectable } from '@nestjs/common';
import { AccountService } from 'src/internal-modules/account/account.service';
import { AuthService } from 'src/internal-modules/auth/auth.service';
import { AccountDbHandlerService } from 'src/internal-modules/external-interface-handlers/database/account-db-handler/account-db-handler.service';
import { OrderDbHandlerService } from 'src/internal-modules/external-interface-handlers/database/order-db-handler/order-db-handler.service';
import { UserDbHandlerService } from 'src/internal-modules/external-interface-handlers/database/user-db-handler/user-db-handler.service';
import { EzmanageApiHandlerService } from 'src/internal-modules/external-interface-handlers/ezmanage-api/ezmanage-api-handler.service';
import { NutshellApiHandlerService } from 'src/internal-modules/external-interface-handlers/nutshell/nutshell-api-handler.service';
import { UserService } from 'src/internal-modules/user/user.service';
import { AdminCreateUserBodyDto } from './dtos/body';
import { SentOrderToCrmQueryDto } from './dtos/query';

@Injectable()
export class AdminInternalInterfaceService {
  constructor(
    private readonly accountDbHandler: AccountDbHandlerService,
    private readonly accountService: AccountService,
    private readonly authService: AuthService,
    private readonly orderDbHandler: OrderDbHandlerService,
    private readonly userDbHandler: UserDbHandlerService,
    private readonly userService: UserService,
    private readonly nutshellApiHandler: NutshellApiHandlerService,
    private readonly ezManagerApiHandler: EzmanageApiHandlerService,
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

    /**
     * Need userId
     */
    const { id: userId } = await this.userDbHandler.createOne({
      accountId,
      firstName,
      lastName,
      email,
      hashedPassword,
      salt,
    });

    const token = await this.authService.signClaimAcctToken({
      userId,
      password,
    });

    /**
     * @TODO Send email.  Use password
     */
    return { token };
  }

  async getOrderNamesForAccount(accountId: string) {
    const orders = await this.orderDbHandler.getManyForAccount(accountId);
    return orders.map((order) => order.name);
  }

  async testNutshellIntegration({
    ref,
    a,
    b,
  }: {
    ref: string;
    a: number;
    b: number;
  }) {
    return this.nutshellApiHandler.testNutshellIntegration({ ref, a, b });
  }

  async getNutshellProducts({ ref }: { ref: any }) {
    return this.nutshellApiHandler.getProducts({ ref });
  }

  async getCatererMenu({ catererId }: { catererId: string }) {
    const ref =
      await this.accountService.getEnvironmentVariablePrefixByCatererId(
        catererId,
      );
    return this.ezManagerApiHandler.getCatererMenu({ catererId, ref });
  }

  async sendOrderToCrm(input: SentOrderToCrmQueryDto) {
    throw new Error('Method not implemented.');
  }
}
