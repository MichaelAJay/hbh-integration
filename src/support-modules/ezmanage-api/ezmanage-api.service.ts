import { Injectable } from '@nestjs/common';
import { CustomLoggerService } from '../custom-logger/custom-logger.service';
import { GraphqlClientService } from './graphql-client.service';

@Injectable()
export class EzmanageApiService {
  constructor(
    private readonly graphqlService: GraphqlClientService,
    private readonly customLogger: CustomLoggerService,
  ) {}

  /**
   * @TODO
   * Add type check
   * @TODO
   * pare down required data
   */
  async getOrder(orderId: string) {
    try {
      const data = (await this.graphqlService.queryOrder(
        orderId,
      )) as IEzManageOrder;
      return data;
    } catch (err) {
      console.error('err', err);
      this.customLogger.error('EzmanageApiService failed', {});
    }
  }
}
