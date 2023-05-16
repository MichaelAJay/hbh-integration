import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus } from 'src/external-modules/database/enum';
import { IOrderModel } from 'src/external-modules/database/models';
import { OrderDbHandlerService } from '../external-interface-handlers/database/order-db-handler/order-db-handler.service';
import { EzmanageApiHandlerService } from '../external-interface-handlers/ezmanage-api/ezmanage-api-handler.service';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderDbService: OrderDbHandlerService,
    private readonly ezManageApiHandler: EzmanageApiHandlerService,
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
    // const ezManageOrder = await this.ezManageApiHandler.getOrder(
    //   orderId,
    //   ref,
    // );

    /**
     * @TODO this is spoofing until I can get some order ids in the system
     */
    const ezManageOrder = { name: 'PLACEHOLDER NAME' };

    /**
     * @TODO fix the date issue
     */
    const now = new Date();
    const data: IOrderModel = {
      accountId,
      catererId,
      name: ezManageOrder.name,
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
    orderId,
    accountId,
  }: {
    orderId: string;
    accountId: string;
  }) {
    const order = await this.orderDbService.getOne(orderId);

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
