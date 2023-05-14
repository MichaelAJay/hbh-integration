import { Controller, Get, Param } from '@nestjs/common';
import { AuthenticatedReq } from 'src/decorators/authenticated-request.decorator';
import { IAuthenticatedRequest } from '../interfaces';
import { OrderService } from './order.service';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get(':id')
  async getOrder(
    @Param('id') orderId: string,
    @AuthenticatedReq() req: IAuthenticatedRequest,
  ) {
    const { accountId, userId, ref } = req;
    return this.orderService.getOrder({ orderId, userId, accountId, ref });
  }
}
