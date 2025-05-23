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
import { AdminCreateUserBodyDto, BulkSendOrdersToCrm } from './dtos/body';
import {
  AdminOrderNameWithAccountScopeQueryDto,
  SentOrderToCrmQueryDto,
} from './dtos/query';
import { OrderService } from 'src/internal-modules/order/order.service';
import {
  IOrderModel,
  IOrderModelWithId,
} from 'src/external-modules/database/models';
import {
  AccountRecordWithId,
  ACCOUNT_REF,
} from 'src/internal-modules/external-interface-handlers/database/account-db-handler/types';
import { createInvoiceTemplate } from './create-invoice-template';
import { InvoiceflowService } from 'src/external-modules/invoiceflow/invoiceflow.service';
import { InvoiceFlowInvoiceData } from 'src/external-modules/invoiceflow/generate-invoice.type';
import { UpdateableOrderModel } from 'src/internal-modules/external-interface-handlers/database/order-db-handler/types';
import { GeneratePrimaryNutshellEntityReturn } from 'src/internal-modules/external-interface-handlers/crm/types/returns';

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
    private readonly invoiceFlowService: InvoiceflowService,
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

    /**
     * Sentry guard so I don't mess up again
     */

    await this.orderDbHandler.updateOne({ orderId, updates: result as any });
    return result;
  }

  async bulkSendEzManageOrdersToCrm({
    accountId,
    orderNames,
  }: {
    accountId: string;
    orderNames: string[];
  }) {
    const account = await this.accountDbHandler.getAccount(accountId);
    if (!account) throw new NotFoundException('Account not found');

    const orders = await this.orderDbHandler.getAllForAccount(accountId);
    const { internalOrders, rejects, badAccounts } = orderNames.reduce(
      (acc, cur) => {
        const matchingOrder = orders.find((order) => order.name === cur);
        if (matchingOrder) {
          if (matchingOrder.accountId === accountId)
            acc.internalOrders.push(matchingOrder);
          else acc.badAccounts.push(matchingOrder.id);
        } else {
          acc.rejects.push(cur);
        }
        return acc;
      },
      {
        internalOrders: [] as IOrderModelWithId[],
        rejects: [] as string[],
        badAccounts: [] as string[],
      },
    );

    // const promiseResults = await Promise.all(
    //   internalOrders.map(async (internalOrder) => {
    //     await new Promise((resolve) => setTimeout(resolve, 1000));
    //     const result = await this.generateCrmEntity({ internalOrder, account });
    //     const updatedResult = await this.orderDbHandler.updateOne({
    //       orderId: internalOrder.id,
    //       updates: result,
    //     });
    //     return updatedResult;
    //   }),
    // );
    const promiseResults: any[] = [];
    for (const internalOrder of internalOrders) {
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const result = await this.generateCrmEntity({ internalOrder, account });
        // const updatedResult =
        await this.orderDbHandler.updateOne({
          orderId: internalOrder.id,
          updates: result as any,
        });
        // return updatedResult;

        promiseResults.push({
          id: result.name,
          invalidKeys: result?.invalidKeys,
        });
      } catch (err) {
        promiseResults.push({
          id: internalOrder.crmId,
          status: 'FAILED',
          reason: (err as any).message,
        });
      }
    }

    const res = {
      promiseResults,
      addedLeadsCt: promiseResults.length,
      rejects,
      badAccounts,
    };
    return res;
  }

  async bulkGenerateInvoices({
    accountId,
    orderNames,
  }: {
    accountId: string;
    orderNames: string[];
  }) {
    const account = await this.accountDbHandler.getAccount(accountId);
    if (!account) throw new NotFoundException('Account not found');

    const orders = await this.orderDbHandler.getAllForAccount(accountId);
    const { internalOrders, rejects, badAccounts } = orderNames.reduce(
      (acc, cur) => {
        const matchingOrder = orders.find((order) => order.name === cur);
        if (matchingOrder) {
          if (matchingOrder.accountId === accountId)
            acc.internalOrders.push(matchingOrder);
          else acc.badAccounts.push(matchingOrder.id);
        } else {
          acc.rejects.push(cur);
        }
        return acc;
      },
      {
        internalOrders: [] as IOrderModelWithId[],
        rejects: [] as string[],
        badAccounts: [] as string[],
      },
    );

    const promiseResults = await Promise.all(
      internalOrders.map(async (internalOrder) => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const result = await this.generateInvoice({ internalOrder, account });
      }),
    );
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
    const result = await this.orderService.generateCRMEntityFromOrder({
      account,
      ezManageOrder,
    });
    if (ezManageOrder.orderSourceType === 'DIRECT_ENTRY') {
      const data = createInvoiceTemplate(ezManageOrder);
      await this.invoiceFlowService.generateInvoice(data);
    }

    return { name: ezManageOrder.orderNumber, ...result };
  }

  private async generateInvoice({
    internalOrder,
    account,
  }: {
    internalOrder: IOrderModelWithId;
    account: AccountRecordWithId;
  }) {
    const { ref } = account;
    const { id: orderId } = internalOrder;
    const ezManageOrder = await this.getEzManageOrder({ orderId, ref });
    if (ezManageOrder.orderSourceType === 'DIRECT_ENTRY') {
      console.log('Sending ', ezManageOrder.orderNumber);
      const data = createInvoiceTemplate(ezManageOrder);
      await this.invoiceFlowService.generateInvoice(data);
    }

    return 'success';
  }
}
