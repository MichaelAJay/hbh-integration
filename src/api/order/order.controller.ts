import { Controller, Get, Param } from '@nestjs/common';
import { AuthenticatedReq } from 'src/decorators/authenticated-request.decorator';
import { IAuthenticatedRequest } from '../interfaces';
import { OrderService } from './order.service';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // @Get('')
  @Get('by-name/:name')
  async getOrderByName(
    @Param('name') orderName: string,
    @AuthenticatedReq() req: IAuthenticatedRequest,
  ) {
    const { accountId, ref } = req;
    return this.orderService.getOrderByName({ orderName, accountId, ref });
  }

  @Get(':id')
  async getOrder(
    @Param('id') orderId: string,
    @AuthenticatedReq() req: IAuthenticatedRequest,
  ) {
    const { accountId, ref } = req;
    return this.orderService.getOrder({ orderId, accountId, ref });
  }
}
