import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { EzmanageApiService } from 'src/external-modules/ezmanage-api/ezmanage-api.service';

@Injectable()
export class EzmanageApiHandlerService {
  constructor(private readonly ezManageApiService: EzmanageApiService) {}

  async getOrder(orderId: string, acctEnvVarPrefix: string) {
    const order = await this.ezManageApiService.getOrder(
      orderId,
      acctEnvVarPrefix,
    );
    if (!(order && order.orderNumber))
      throw new UnprocessableEntityException('Bad data from graphql');
    return { name: order.orderNumber };
  }

  async getOrderName({
    orderId,
    acctEnvVarPrefix,
  }: {
    orderId: string;
    acctEnvVarPrefix: string;
  }) {
    const order = await this.ezManageApiService.getOrderName({
      orderId,
      acctEnvVarPrefix,
    });
    return '';
  }
}
