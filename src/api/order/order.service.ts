import { Injectable } from '@nestjs/common';
import { OrderInternalInterfaceService } from './order-internal-interface.service';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderInternalInterface: OrderInternalInterfaceService,
  ) {}

  async getOrder({
    orderId,
    accountId,
    ref: ref,
  }: {
    orderId: string;
    accountId: string;
    ref: string;
  }) {
    return await this.orderInternalInterface.getOrder({
      orderId,
      accountId,
      ref,
    });
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
    return await this.orderInternalInterface.getOrderByName({
      orderName,
      accountId,
      ref,
    });
  }
}
