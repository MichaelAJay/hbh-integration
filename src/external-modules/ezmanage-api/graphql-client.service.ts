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
   * GENERAL
   */
  async setAuthHeaderOnClient(client: GraphQLClient, ref: string) {
    const { EZMANAGE_AUTH_TOKEN_POSTFIX } = process.env;
    if (!EZMANAGE_AUTH_TOKEN_POSTFIX)
      throw new InternalServerErrorException('Bad config');
    const authToken =
      process.env[`${ref}_${EZMANAGE_AUTH_TOKEN_POSTFIX}`];
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

  async getOrderName({
    orderId,
    ref,
  }: {
    orderId: string;
    ref: string;
  }) {
    const client = this.setAuthHeaderOnClient(this.client, ref);

    try {
      const query = gql`
        {
          order(id: "${orderId}") {
            orderNumber
          }
        }
      `;
    } catch (err) {
      console.error('err', err);
      throw err;
    }
  }
}
