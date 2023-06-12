import { Injectable, NotFoundException } from '@nestjs/common';
import { IGetOrderOutput } from 'src/api/order/interfaces/output';
import { DbOrderStatus } from 'src/external-modules/database/enum';
import {
  IOrderModel,
  IOrderModelWithId,
} from 'src/external-modules/database/models';
import { IEzManageOrder } from 'src/external-modules/ezmanage-api/interfaces/gql/responses';
import { CustomLoggerService } from 'src/support-modules/custom-logger/custom-logger.service';
import { OrderDbHandlerService } from '../external-interface-handlers/database/order-db-handler/order-db-handler.service';
import { EzmanageApiHandlerService } from '../external-interface-handlers/ezmanage-api/ezmanage-api-handler.service';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderDbService: OrderDbHandlerService,
    private readonly ezManageApiHandler: EzmanageApiHandlerService,
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

    /**
     * Create Nutshell Lead
     */

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
      /**
       * @TODO fix
       */
      crmId: null,
      acceptedAt: now,
      lastUpdatedAt: now,
    };

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
