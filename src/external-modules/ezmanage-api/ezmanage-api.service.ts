import { Injectable } from '@nestjs/common';
import { ACCOUNT_REF } from 'src/internal-modules/external-interface-handlers/database/account-db-handler/types';
import { GraphqlClientService } from './graphql-client.service';

@Injectable()
export class EzmanageApiService {
  constructor(private readonly graphqlService: GraphqlClientService) {}

  async getOrder(orderId: string, ref: ACCOUNT_REF) {
    try {
      return await this.graphqlService.queryOrder({ orderId, ref });
    } catch (err) {
      throw err;
    }
  }

  async getOrderName({ orderId, ref }: { orderId: string; ref: string }) {
    return await this.graphqlService.queryOrderName({
      orderId,
      ref,
    });
  }

  async getCatererMenu({ catererId, ref }: { catererId: string; ref }) {
    return await this.graphqlService.getCatererMenu({ catererId, ref });
  }
}
