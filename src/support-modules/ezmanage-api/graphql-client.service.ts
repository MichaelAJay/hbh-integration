import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { GraphQLClient, gql } from 'graphql-request';

@Injectable()
export class GraphqlClientService {
  private readonly client: GraphQLClient;

  constructor() {
    const { EZMANAGE_API_URL: apiUrl, EZMANAGE_AUTH_TOKEN: authToken } =
      process.env;
    if (!(apiUrl && authToken))
      throw new InternalServerErrorException('Bad config');
    this.client = new GraphQLClient(apiUrl, {
      headers: {
        Authorization: authToken,
      },
    });
  }

  /**
   * @TODO
   * Make it fail
   *
   * @TODO
   * determine what happens when the orderId is bad
   */
  async queryOrder(orderId: string) {
    try {
      const query = gql`
        {
          Order(id: ${orderId}) {}
        }
      `;
      const data = await this.client.request(query);
      return data;
    } catch (err) {
      console.error('err', err);
      throw err;
    }
  }
}
