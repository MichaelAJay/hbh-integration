import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { GraphQLClient, gql } from 'graphql-request';

@Injectable()
export class GraphqlClientService {
  private readonly client: GraphQLClient;

  constructor() {
    const { EZMANAGE_API_URL: apiUrl } = process.env;
    if (!apiUrl) throw new InternalServerErrorException('Bad config');
    this.client = new GraphQLClient(apiUrl);
  }

  /**
   * @TODO
   * Make it fail
   *
   * @TODO
   * determine what happens when the orderId is bad
   */
  async queryOrder(orderId: string, accEnvVarPrefix: string) {
    try {
      const { AUTH_TOKEN_POSTFIX } = process.env;
      if (!AUTH_TOKEN_POSTFIX)
        throw new InternalServerErrorException('Bad config');
      const authToken = process.env[`${accEnvVarPrefix}_${AUTH_TOKEN_POSTFIX}`];
      if (!authToken) throw new InternalServerErrorException('Bad config');
      this.client.setHeader('Authorization', authToken);

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
