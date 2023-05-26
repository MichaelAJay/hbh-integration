import { Injectable } from '@nestjs/common';
import { GraphqlClientService } from './graphql-client.service';

@Injectable()
export class EzmanageApiService {
  constructor(private readonly graphqlService: GraphqlClientService) {}

  async getOrder(orderId: string, ref: string) {
    return await this.graphqlService.queryOrder({ orderId, ref });
  }

  async getOrderName({ orderId, ref }: { orderId: string; ref: string }) {
    return await this.graphqlService.queryOrderName({
      orderId,
      ref,
    });
  }
}
