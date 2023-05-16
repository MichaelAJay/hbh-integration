import { ForbiddenException, Injectable } from '@nestjs/common';
import { OrderDbHandlerService } from 'src/internal-modules/external-interface-handlers/database/order-db-handler/order-db-handler.service';
import { OrderService } from 'src/internal-modules/order/order.service';

@Injectable()
export class OrderInternalInterfaceService {
  constructor(
    private readonly orderService: OrderService,
    private readonly orderDbHandler: OrderDbHandlerService,
  ) {}

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
    const orderName = await this.orderService.getOrderName({
      orderId,
      ref,
    });

    return orderName;
  }

  async getOrderByName({
    orderName,
    accountId,
    ref,
  }: {
    orderName: string;
    accountId: string;
    ref: string;
  }) {
    const order = await this.orderDbHandler.findByNameForAccount(
      orderName,
      accountId,
    );
    return order;
  }
}
