import { ForbiddenException, Injectable } from '@nestjs/common';
import { OrderService } from 'src/internal-modules/order/order.service';

@Injectable()
export class OrderInternalInterfaceService {
  constructor(private readonly orderService: OrderService) {}

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
    if (!this.orderService.doesOrderBelongToAccount({ orderId, accountId }))
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
}
