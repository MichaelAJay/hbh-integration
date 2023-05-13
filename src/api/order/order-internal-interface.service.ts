import { Injectable } from '@nestjs/common';
import { OrderService } from 'src/internal-modules/order/order.service';

@Injectable()
export class OrderInternalInterfaceService {
  constructor(private readonly orderService: OrderService) {}

  async getOrder(orderId: string, userId: string) {
    throw new Error('Method not implemented.');
  }
}
