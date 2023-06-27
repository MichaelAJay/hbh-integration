import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InternalError } from 'src/common/classes';
import { AccountService } from 'src/internal-modules/account/account.service';
import { AuthService } from 'src/internal-modules/auth/auth.service';
import { CrmHandlerService } from 'src/internal-modules/external-interface-handlers/crm/crm-handler.service';
import { outputH4HOrderToCrm } from 'src/internal-modules/external-interface-handlers/crm/accounts/H4H/utility';
import { AccountDbHandlerService } from 'src/internal-modules/external-interface-handlers/database/account-db-handler/account-db-handler.service';
import { OrderDbHandlerService } from 'src/internal-modules/external-interface-handlers/database/order-db-handler/order-db-handler.service';
import { UserDbHandlerService } from 'src/internal-modules/external-interface-handlers/database/user-db-handler/user-db-handler.service';
import { EzmanageApiHandlerService } from 'src/internal-modules/external-interface-handlers/ezmanage-api/ezmanage-api-handler.service';
import { UserService } from 'src/internal-modules/user/user.service';
import { AdminCreateUserBodyDto } from './dtos/body';
import {
  AdminOrderNameWithAccountScopeQueryDto,
  SentOrderToCrmQueryDto,
} from './dtos/query';

@Injectable()
export class AdminInternalInterfaceService {
  constructor(
    private readonly accountDbHandler: AccountDbHandlerService,
    private readonly accountService: AccountService,
    private readonly authService: AuthService,
    private readonly orderDbHandler: OrderDbHandlerService,
    private readonly userDbHandler: UserDbHandlerService,
    private readonly userService: UserService,
    private readonly ezManagerApiHandler: EzmanageApiHandlerService,
    private readonly crmHandler: CrmHandlerService,
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
    const orders = await this.orderDbHandler.getAllForAccount(accountId);
    return orders.map((order) => order.name);
  }

  async getCrmProducts({ accountId }: { accountId: string }) {
    const account = await this.accountDbHandler.getAccount(accountId);
    if (!account) {
      throw new BadRequestException('Account not found with specified id');
    }
    return this.crmHandler.getProducts({ account });
  }

  async getCatererMenu({ catererId }: { catererId: string }) {
    const ref =
      await this.accountService.getEnvironmentVariablePrefixByCatererId(
        catererId,
      );
    return this.ezManagerApiHandler.getCatererMenu({ catererId, ref });
  }

  async sendEzManageOrderToCrm({
    'order-id': orderId,
    'account-id': accountId,
    ref,
  }: SentOrderToCrmQueryDto) {
    const ezManageOrder = await this.getEzManageOrder({ orderId, ref });
    const account = await this.accountDbHandler.getAccount(accountId);
    if (!account) throw new NotFoundException('Account not found');
    const crmId = await this.crmHandler.generateCRMEntity({
      account,
      order: ezManageOrder,
    });

    if (crmId) {
      await this.orderDbHandler.updateOne({
        orderId,
        updates: { crmId },
      });
    }
    return crmId;
  }

  /**
   * Helpers
   */
  private async getEzManageOrder({
    orderId,
    ref,
  }: {
    orderId: string;
    ref: string;
  }) {
    return this.ezManagerApiHandler.getOrder({ orderId, ref });
  }

  async getCrmEntityFromOrderName({
    'order-name': orderName,
    'account-id': accountId,
    ref,
  }: AdminOrderNameWithAccountScopeQueryDto) {
    const [internalOrder, account] = await Promise.all([
      this.orderDbHandler.findByNameForAccount(orderName, accountId),
      this.accountDbHandler.getAccount(accountId),
    ]);

    if (!account) {
      const message = `No account found matching ${accountId}`;
      console.error(message);
      throw new InternalError(message);
    }

    const order = await this.getEzManageOrder({
      orderId: internalOrder.id,
      ref,
    });

    const { lead, invalidKeys } = outputH4HOrderToCrm({ order, account });
    return { lead, invalidKeys };
  }

  async generateCrmEntityFromOrderName({
    'order-name': orderName,
    'account-id': accountId,
    ref,
  }: AdminOrderNameWithAccountScopeQueryDto) {
    const [internalOrder, account] = await Promise.all([
      this.orderDbHandler.findByNameForAccount(orderName, accountId),
      this.accountDbHandler.getAccount(accountId),
    ]);

    if (!account) {
      const message = `No account found matching ${accountId}`;
      console.error(message);
      throw new InternalError(message);
    }

    const order = await this.getEzManageOrder({
      orderId: internalOrder.id,
      ref,
    });

    const leadId = await this.crmHandler.generateCRMEntity({ account, order });
    return leadId;
  }
}
