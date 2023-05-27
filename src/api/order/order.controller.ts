import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { AuthenticatedReq } from 'src/decorators/authenticated-request.decorator';
import { IAuthenticatedRequest } from '../interfaces';
import { IUpdateStatus } from './interfaces';
import { OrderService } from './order.service';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  async getOrdersByAccount(@AuthenticatedReq() req: IAuthenticatedRequest) {
    const { accountId } = req;
    return this.orderService.getOrdersByAccount({ accountId });
  }

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

  @Patch('statuses')
  async updateOrdersStatuses(
    @Body() updates: IUpdateStatus[],
    @AuthenticatedReq() req: IAuthenticatedRequest,
  ) {
    const { accountId, ref } = req;
    return this.orderService.updateStatuses({ updates, accountId, ref });
  }
}
