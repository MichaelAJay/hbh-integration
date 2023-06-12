import { Injectable, NotFoundException } from '@nestjs/common';
import { IGetOrderOutput } from 'src/api/order/interfaces/output';
import { DbOrderStatus } from 'src/external-modules/database/enum';
import {
  IOrderModel,
  IOrderModelWithId,
} from 'src/external-modules/database/models';
import { IEzManageOrder } from 'src/external-modules/ezmanage-api/interfaces/gql/responses';
import { CustomLoggerService } from 'src/support-modules/custom-logger/custom-logger.service';
import { CrmHandlerService } from '../external-interface-handlers/crm/crm-handler.service';
import { AccountDbHandlerService } from '../external-interface-handlers/database/account-db-handler/account-db-handler.service';
import { OrderDbHandlerService } from '../external-interface-handlers/database/order-db-handler/order-db-handler.service';
import { EzmanageApiHandlerService } from '../external-interface-handlers/ezmanage-api/ezmanage-api-handler.service';

@Injectable()
export class OrderService {
  constructor(
    private readonly accountDbService: AccountDbHandlerService,
    private readonly orderDbService: OrderDbHandlerService,
    private readonly ezManageApiHandler: EzmanageApiHandlerService,
    private readonly crmHandler: CrmHandlerService,
    private readonly logger: CustomLoggerService,
  ) {}

  async createOrder({
    accountId,
    catererId,
    orderId,
    status,
    occurredAt,
    ref,
    catererName,
  }: {
    accountId: string;
    catererId: string;
    orderId: string;
    status: DbOrderStatus;
    occurredAt: string;
    ref: string;
    catererName: string;
  }) {
    /**
     * Need order name for db
     */
    /**
     * We should actually get the whole order and add it to Nutshell here.
     */
    const ezManageOrderName = await this.ezManageApiHandler
      .getOrderName({
        orderId,
        ref,
      })
      .catch((reason) => {
        const msg = 'Failed to retrieve order name';
        this.logger.error(msg, reason);
      });

    const ezManageOrder = await this.ezManageApiHandler
      .getOrder({ orderId, ref })
      .catch((reason) => {
        const msg = `Failed to retrieve order ${orderId}`;
        this.logger.error(msg, reason);
        throw reason;
      });

    const account = await this.accountDbService.getAccount(accountId);
    /** null account should not necessarily throw  */
    let crmEntityId: string | undefined;
    if (account) {
      /**
       * Create Nutshell Lead
       */
      crmEntityId = await this.crmHandler.generateCRMEntity({
        account,
        order: ezManageOrder,
      });
    }

    /**
     * @TODO fix the date issue
     */
    const now = new Date();
    const data: IOrderModel = {
      accountId,
      catererId,
      catererName,
      name: ezManageOrderName || 'PLACEHOLDER NAME',
      status,
      crmId: null,
      acceptedAt: now,
      lastUpdatedAt: now,
    };

    if (crmEntityId) data.crmId = crmEntityId;

    await this.orderDbService.create({ orderId, data });
    return;
  }

  async handleCancelledOrder(orderId: string) {
    /**
     * This should interface with the Nutshell API and do some undetermined number of things
     */
    return;
  }

  async doesOrderBelongToAccount({
    input,
    accountId,
  }: {
    input: string | IOrderModelWithId;
    accountId: string;
  }) {
    const order =
      typeof input === 'string'
        ? await this.orderDbService.getOne(input)
        : input;

    if (!order) throw new NotFoundException();

    // console.log('Order ID: ', order.id);
    return order.accountId === accountId;
  }

  /**
   * Implementation note:
   * It would be good if whatever called this had access to the whole order - is that possible?
   */
  async getEzManageOrder({
    order,
    ref,
  }: {
    order: IOrderModelWithId;
    ref: string;
  }) {
    return await this.ezManageApiHandler.getOrder({
      orderId: order.id,
      ref,
    });
  }

  async getOrderName({ orderId, ref }: { orderId: string; ref: string }) {
    return this.ezManageApiHandler.getOrderName({
      orderId,
      ref,
    });
  }

  async generateLeadFromOrder(ezManageOrder: IEzManageOrder) {}

  outputOrderToCRM({
    ref,
    order,
  }: {
    ref: string;
    order: Omit<IGetOrderOutput, 'catererName'>;
  }) {}
}
