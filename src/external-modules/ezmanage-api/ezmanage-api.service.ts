import { Injectable } from '@nestjs/common';
import { CustomLoggerService } from '../../support-modules/custom-logger/custom-logger.service';
import { GraphqlClientService } from './graphql-client.service';

@Injectable()
export class EzmanageApiService {
  constructor(
    private readonly graphqlService: GraphqlClientService,
    private readonly customLogger: CustomLoggerService,
  ) {}

  async getOrder(orderId: string, ref: string) {
    try {
      // const data = (await this.graphqlService.queryOrder(
      //   orderId,
      //   ref,
      // )) as IEzManageOrder;
      const data = await this.graphqlService.queryOrder({ orderId, ref });
      return data;
    } catch (err) {
      console.error('err', err);
      this.customLogger.error('EzmanageApiService failed', {});
    }
  }

  async getOrderName({ orderId, ref }: { orderId: string; ref: string }) {
    return await this.graphqlService.queryOrderName({
      orderId,
      ref,
    });
  }
}
