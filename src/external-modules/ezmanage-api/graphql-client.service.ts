import {
  Injectable,
  InternalServerErrorException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { GraphQLClient, gql } from 'graphql-request';
import { CustomErrorObject } from 'src/common/types';
import { CustomLoggerService } from 'src/support-modules/custom-logger/custom-logger.service';
import { isGetOrderNameReturn, isIGetH4HCatererMenu } from './interfaces/gql';
import { IEzManageOrder } from './interfaces/gql/responses';
import { validateEzManageOrder } from './validators';

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
   * Specific queries
   */
  async queryOrder({ orderId, ref }: { orderId: string; ref: string }) {
    const client = this.setAuthHeaderOnClient(this.client, ref);

    try {
      const query = gql`
      {
        order(id: "${orderId}") {
          orderNumber
          uuid
          event {
              timestamp
              timeZoneOffset
              address {
                  city
                  name
                  state
                  street
                  street2
                  street3
                  zip
              }
              contact {
                  name
                  phone
              }
          }
          orderCustomer {
              firstName
              lastName
          }
          totals {
              subTotal {
                  subunits
              }
              tip {
                  subunits
              }
          }
          catererCart {
              feesAndDiscounts(type: DELIVERY_FEE) {
                  name
                  cost {
                      subunits
                  }
              }
              orderItems {
                  quantity
                  name
                  totalInSubunits {
                      subunits
                  }
              }
              totals {
                  catererTotalDue
              }
          }
          orderSourceType
      }
      }
      `;
      const data: { order: any } = await client.request(query);

      if (!validateEzManageOrder(data.order)) {
        const message = 'Malformed GQL order response';
        this.logger.error(message, { id: orderId });
        throw new UnprocessableEntityException({
          message,
          isLogged: true,
        } as CustomErrorObject);
      }

      return data.order as IEzManageOrder;
    } catch (err: any) {
      if (
        typeof err.message === 'string' &&
        typeof err.isLogged === 'boolean' &&
        err.isLogged
      ) {
        throw err;
      }
      const message = err.message || 'GraphQL queryOrder error';
      this.logger.error(message, { id: orderId });
      throw new InternalServerErrorException({
        message,
        isLogged: true,
      } as CustomErrorObject);
    }
  }

  /**
   * This is testable by sending a bogus UUID
   */
  async queryOrderName({ orderId, ref }: { orderId: string; ref: string }) {
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
        const message = 'Returned data does not match expected data shape';
        this.logger.error(message, { data });
        throw new UnprocessableEntityException({
          message,
          isLogged: true,
        } as CustomErrorObject);
      }
      return data.order.orderNumber;
    } catch (err: any) {
      if (
        typeof err.message === 'string' &&
        typeof err.isLogged === 'boolean' &&
        err.isLogged
      ) {
        throw err;
      }
      const message = err.message || 'GraphQL queryOrderName error';
      this.logger.error(message, { id: orderId });
      throw new InternalServerErrorException({
        message,
        isLogged: true,
      } as CustomErrorObject);
    }
  }

  async getCatererMenu({ catererId, ref }: { catererId: string; ref: string }) {
    const client = this.setAuthHeaderOnClient(this.client, ref);

    try {
      const query = gql`
      {
        menu(catererId: "${catererId}") {
            endDate
            id
            name
            startDate
            categories {
                id
                name
                items {
                    id
                    name
                    originalItemId
                    status
                    comboComponents {
                        name
                        constituentItems {
                            id
                            name
                            status
                        }
                    }
                }
            }
        }
    }
      `;
      const data = await client.request(query);

      if (!isIGetH4HCatererMenu(data)) {
        const message = 'Returned data does not match expected data shape';
        this.logger.error(message, { data });
        throw new UnprocessableEntityException({
          message,
          isLogged: true,
        } as CustomErrorObject);
      }
      return data;
    } catch (err: any) {
      if (
        typeof err.message === 'string' &&
        typeof err.isLogged === 'boolean' &&
        err.isLogged
      ) {
        throw err;
      }
      const message = err.message || 'GraphQL getCatererMenu error';
      this.logger.error(message, { id: catererId });
      throw new InternalServerErrorException({
        message,
        isLogged: true,
      } as CustomErrorObject);
    }
  }
}
