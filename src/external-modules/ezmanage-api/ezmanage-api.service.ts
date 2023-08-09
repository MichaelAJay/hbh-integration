import { Injectable } from '@nestjs/common';
import { ACCOUNT_REF } from 'src/internal-modules/external-interface-handlers/database/account-db-handler/types';
import { GraphqlClientService } from './graphql-client.service';

@Injectable()
export class EzmanageApiService {
  constructor(private readonly graphqlService: GraphqlClientService) {}

  async getOrder(orderId: string, ref: ACCOUNT_REF) {
    return this.graphqlService.queryOrder({ orderId, ref });
  }

  async getOrderName({ orderId, ref }: { orderId: string; ref: ACCOUNT_REF }) {
    return this.graphqlService.queryOrderName({
      orderId,
      ref,
    });
  }

  async getCatererMenu({ catererId, ref }: { catererId: string; ref }) {
    return this.graphqlService.getCatererMenu({ catererId, ref });
  }
}
