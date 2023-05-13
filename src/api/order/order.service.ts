import { Injectable } from '@nestjs/common';
import { OrderInternalInterfaceService } from './order-internal-interface.service';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderInternalInterface: OrderInternalInterfaceService,
  ) {}

  async getOrder(orderId: string, userId: string) {
    return this.orderInternalInterface.getOrder(orderId, userId);
  }
}
