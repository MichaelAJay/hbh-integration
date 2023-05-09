import { Injectable } from '@nestjs/common';
import { CustomLoggerService } from '../../support-modules/custom-logger/custom-logger.service';
import { GraphqlClientService } from './graphql-client.service';
import { IEzManageOrder } from './interfaces';

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
  async getOrder(orderId: string, authTokenPrefix: string) {
    try {
      const data = (await this.graphqlService.queryOrder(
        orderId,
        authTokenPrefix,
      )) as IEzManageOrder;
      return data;
    } catch (err) {
      console.error('err', err);
      this.customLogger.error('EzmanageApiService failed', {});
    }
  }
}
