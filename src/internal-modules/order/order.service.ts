import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus } from 'src/external-modules/database/enum';
import {
  IOrderModel,
  IOrderModelWithId,
} from 'src/external-modules/database/models';
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
  }: {
    accountId: string;
    catererId: string;
    orderId: string;
    status: OrderStatus;
    occurredAt: string;
    ref: string;
  }) {
    /**
     * Need order name for db
     */
    /**
     * @TODO add request to check for order name
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
     * @TODO fix the date issue
     */
    const now = new Date();
    const data: IOrderModel = {
      accountId,
      catererId,
      name: ezManageOrderName || 'PLACEHOLDER NAME',
      status,
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

    return order.accountId === accountId;
  }

  async getOrderName({ orderId, ref }: { orderId: string; ref: string }) {
    return this.ezManageApiHandler.getOrderName({
      orderId,
      ref,
    });
  }
}
