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
    this.client = new GraphQLClient(apiUrl);
  }

  async queryOrder(orderId: string) {
    const query = gql``;
    const data = await this.client.request(query);
    return data;
  }
}
