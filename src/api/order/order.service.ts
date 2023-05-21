import { Injectable } from '@nestjs/common';
import { CustomLoggerService } from 'src/support-modules/custom-logger/custom-logger.service';
import { OrderInternalInterfaceService } from './order-internal-interface.service';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderInternalInterface: OrderInternalInterfaceService,
    private readonly logger: CustomLoggerService,
  ) {}

  async getOrdersByAccount({ accountId }: { accountId: string }) {
    return await this.orderInternalInterface.getOrdersByAccount({ accountId });
  }

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
      orderName: orderName
        .split('')
        .filter((char) => /[a-zA-Z0-9]/.test(char))
        .join(''),
      accountId,
      ref,
    });
  }
}
