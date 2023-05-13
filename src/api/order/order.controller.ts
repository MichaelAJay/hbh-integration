import { Controller, Get, Param, Req } from '@nestjs/common';
import { OrderService } from './order.service';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get(':id')
  async getOrder(@Param('id') orderId: string, @Req() req) {
    return this.orderService.getOrder(orderId, req.userId as string);
  }
}
