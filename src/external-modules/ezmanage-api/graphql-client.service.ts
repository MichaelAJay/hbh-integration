import {
  Injectable,
  InternalServerErrorException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { GraphQLClient, gql } from 'graphql-request';
import { CustomLoggerService } from 'src/support-modules/custom-logger/custom-logger.service';
import { isGetOrderNameReturn } from './interfaces/gql';

@Injectable()
export class GraphqlClientService {
  private readonly client: GraphQLClient;

  constructor(private readonly logger: CustomLoggerService) {
    const { EZMANAGE_API_URL: apiUrl } = process.env;
    if (!apiUrl) throw new InternalServerErrorException('Bad config');
    this.client = new GraphQLClient(apiUrl);
  }

  /**
   * GENERAL
   */
  private setAuthHeaderOnClient(client: GraphQLClient, ref: string) {
    const { EZMANAGE_AUTH_TOKEN_POSTFIX } = process.env;
    if (!EZMANAGE_AUTH_TOKEN_POSTFIX)
      throw new InternalServerErrorException('Bad config');
    const authToken = process.env[`${ref}_${EZMANAGE_AUTH_TOKEN_POSTFIX}`];
    if (!authToken) throw new InternalServerErrorException('Bad config');
    client.setHeader('Authorization', authToken);
    return client;
  }

  /**
   * @TODO
   * Make it fail
   *
   * @TODO
   * determine what happens when the orderId is bad
   */

  /**
   * Specific queries
   */
  async queryOrder(orderId: string, ref: string) {
    try {
      /**
       * This format returns a good result:
       * data = {
       *  order: {
       *    orderNumber
       *  }
       * }
       */
      const query = gql`
      {
        order(id: "${orderId}") {
          orderNumber
        }
      }
      `;
      const data = this.client.request(query);
      return data;
    } catch (err) {
      console.error('err', err);
      throw err;
    }
  }

  async getOrderName({ orderId, ref }: { orderId: string; ref: string }) {
    const client = this.setAuthHeaderOnClient(this.client, ref);

    try {
      const query = gql`
        {
          order(id: "${orderId}") {
            orderNumber
          }
        }
      `;
      const data = await client.request(query);

      if (!isGetOrderNameReturn(data)) {
        const msg = 'Returned data does not match expected data shape';
        this.logger.error(msg, { data });
        throw new UnprocessableEntityException({ reason: msg });
      }
      return data.order.orderNumber;
    } catch (err) {
      console.error('err', err);
      throw err;
    }
  }
}
