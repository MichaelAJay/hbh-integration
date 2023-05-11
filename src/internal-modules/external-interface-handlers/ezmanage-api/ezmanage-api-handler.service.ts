import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { EzmanageApiService } from 'src/external-modules/ezmanage-api/ezmanage-api.service';

@Injectable()
export class EzmanageApiHandlerService {
  constructor(private readonly ezManageApiService: EzmanageApiService) {}

  async getOrder(orderId: string, accEnvVarPrefix: string) {
    const order = await this.ezManageApiService.getOrder(
      orderId,
      accEnvVarPrefix,
    );
    if (!(order && order.orderNumber))
      throw new UnprocessableEntityException('Bad data from graphql');
    return { name: order.orderNumber };
  }
}
