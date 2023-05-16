import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { EzmanageApiService } from 'src/external-modules/ezmanage-api/ezmanage-api.service';

@Injectable()
export class EzmanageApiHandlerService {
  constructor(private readonly ezManageApiService: EzmanageApiService) {}

  async getOrder(orderId: string, ref: string) {
    const order = await this.ezManageApiService.getOrder(orderId, ref);
    if (!(order && order.orderNumber))
      throw new UnprocessableEntityException('Bad data from graphql');
    return { name: order.orderNumber };
  }

  async getOrderName({ orderId, ref }: { orderId: string; ref: string }) {
    return await this.ezManageApiService.getOrderName({
      orderId,
      ref,
    });
  }
}
