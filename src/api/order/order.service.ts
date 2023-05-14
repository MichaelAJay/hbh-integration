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
    ref: acctEnvVarPrefix,
  }: {
    orderId: string;
    accountId: string;
    ref: string;
  }) {
    return this.orderInternalInterface.getOrder({
      orderId,
      accountId,
      acctEnvVarPrefix,
    });
  }
}
