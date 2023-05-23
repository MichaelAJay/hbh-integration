import { ForbiddenException, Injectable } from '@nestjs/common';
import { OrderDbHandlerService } from 'src/internal-modules/external-interface-handlers/database/order-db-handler/order-db-handler.service';
import { OrderService } from 'src/internal-modules/order/order.service';
import { IGetOrderOutput } from './interfaces/output';
import { GetOrdersByAccount } from './types/output/get-orders-by-account.type';

@Injectable()
export class OrderInternalInterfaceService {
  constructor(
    private readonly orderService: OrderService,
    private readonly orderDbHandler: OrderDbHandlerService,
  ) {}

  /**
   * @TODO need to think about pagination
   */
  async getOrdersByAccount({
    accountId,
  }: {
    accountId: string;
  }): Promise<GetOrdersByAccount> {
    const orders = await this.orderDbHandler.getManyForAccount(accountId);
    return orders.map((order) => ({
      id: order.id,
      name: order.name,
      status: order.status,
      caterer: order.catererName,
    }));
  }

  async getOrder({
    orderId,
    accountId,
    ref,
  }: {
    orderId: string;
    accountId: string;
    ref: string;
  }) {
    /**
     * Confirm that order and user belong to the same account
     */
    if (
      !this.orderService.doesOrderBelongToAccount({ input: orderId, accountId })
    )
      throw new ForbiddenException({ reason: 'WRONG_ACCT' });

    /**
     * Get order from EZManage
     */
    const order = await this.orderService.getOrder({
      orderId,
      ref,
    });

    return order;
  }

  async getOrderByName({
    orderName,
    accountId,
    ref,
  }: {
    orderName: string;
    accountId: string;
    ref: string;
  }): Promise<IGetOrderOutput> {
    const order = await this.orderDbHandler.findByNameForAccount(
      orderName,
      accountId,
    );

    const ezManageOrder = await this.getOrder({
      orderId: order.id,
      accountId,
      ref,
    });

    return { catererName: order.catererName, ...ezManageOrder };
  }
}
