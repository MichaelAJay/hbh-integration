import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
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
import { OrderService } from 'src/internal-modules/order/order.service';
import { IOrderModelWithId } from 'src/external-modules/database/models';
import {
  AccountRecordWithId,
  ACCOUNT_REF,
} from 'src/internal-modules/external-interface-handlers/database/account-db-handler/types';

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
    private readonly orderService: OrderService,
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
  }: SentOrderToCrmQueryDto) {
    const [internalOrder, account] = await Promise.all([
      this.orderDbHandler.getOne(orderId),
      this.accountDbHandler.getAccount(accountId),
    ]);
    if (!account) throw new NotFoundException('Account not found');
    if (!internalOrder) throw new NotFoundException('Order not found');
    if (internalOrder.accountId !== accountId)
      throw new UnauthorizedException('Order does not belong to account');
    const result = await this.generateCrmEntity({ internalOrder, account });

    await this.orderDbHandler.updateOne({ orderId, updates: result });
    return result;
  }

  /**
   * Helpers
   */
  private async getEzManageOrder({
    orderId,
    ref,
  }: {
    orderId: string;
    ref: ACCOUNT_REF;
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
    if (internalOrder.accountId !== accountId)
      throw new UnauthorizedException('Order does not belong to account');

    // const leadId = await this.crmHandler.generateCRMEntity({ account, order });
    // return leadId;

    const result = await this.generateCrmEntity({ internalOrder, account });

    return result;
  }

  private async generateCrmEntity({
    internalOrder,
    account,
  }: {
    internalOrder: IOrderModelWithId;
    account: AccountRecordWithId;
  }) {
    const { ref } = account;
    const { id: orderId } = internalOrder;
    const ezManageOrder = await this.getEzManageOrder({ orderId, ref });
    return await this.orderService.generateCRMEntityFromOrder({
      account,
      ezManageOrder,
    });
  }
}
