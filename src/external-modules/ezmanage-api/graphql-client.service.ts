import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { GraphQLClient, gql } from 'graphql-request';
import { CustomErrorObject } from 'src/common/types';
import { isGetOrderNameReturn, isIGetH4HCatererMenu } from './interfaces/gql';
import { IEzManageOrder } from './interfaces/gql/responses';
import { validateEzManageOrder } from './validators';
import * as Sentry from '@sentry/node';
import { OrderManagerError } from 'src/common/classes';

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

    // const badOrderId = '71185f7d-2298-44af-b079-4c34d3856ef68';
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
          caterer {
            address {
              city
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
                  customizations {
                    customizationTypeName
                    name
                    quantity
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

    /**
     * The response is an object with a property 'data' - at least in Postman
     * But here it looks like that's not the case...
     */
    const response = await client.request(query).catch((reason) => {
      if (
        reason !== null &&
        typeof reason === 'object' &&
        'response' in reason &&
        reason['response'] !== null &&
        typeof reason['response'] === 'object' &&
        'data' in reason['response'] &&
        reason['response']['data'] !== null &&
        typeof reason['response']['data'] === 'object' &&
        'order' in reason['response']['data'] &&
        reason['response']['data']['order'] === null
      ) {
        const err = new NotFoundException(
          'Order not found with id for account',
        );
        Sentry.withScope((scope) => {
          scope.setExtras({
            orderId,
            ref,
          });
          Sentry.captureException(err);
        });
        throw err;
      } else {
        Sentry.withScope((scope) => {
          scope.setExtra('message', 'GrapQL client queryOrder failed');
          Sentry.captureException(reason);
        });
        throw reason;
      }
    });

    /** FORM SHOULD BE (below) */
    // const response = {
    //   order: {...},
    // };

    if (
      !(
        response !== null &&
        typeof response === 'object' &&
        'order' in response
      )
    ) {
      const message = 'Malformed GQL response';
      const err = new UnprocessableEntityException(message);
      Sentry.withScope((scope) => {
        scope.setExtra('response', response);
        Sentry.captureException(err);
      });
      throw err;
    }

    if (!validateEzManageOrder(response['order'])) {
      const message = 'Malformed GQL order response';

      const err = new UnprocessableEntityException({
        message,
        isLogged: true,
      } as CustomErrorObject);
      Sentry.withScope((scope) => {
        scope.setExtra('response', response);
        Sentry.captureException(err);
      });
      throw err;
    }

    return response['order'] as IEzManageOrder;
  }

  /**
   * This is testable by sending a bogus UUID
   */
  async queryOrderName({ orderId, ref }: { orderId: string; ref: string }) {
    const client = this.setAuthHeaderOnClient(this.client, ref);

    const query = gql`
        {
          order(id: "${orderId}") {
            orderNumber
          }
        }
      `;
    const response = await client.request(query).catch((reason) => {
      let message = 'GraphQL client request failed for queryOrderName';
      if (reason instanceof Error) {
        message = reason.message;
      } else if (typeof reason === 'string') {
        message = reason;
      }

      const err = new OrderManagerError(message);
      Sentry.withScope((scope) => {
        scope.setExtras({ orderId, ref, reason });
        Sentry.captureException(err);
      });
      throw err;
    });

    if (!isGetOrderNameReturn(response)) {
      const err = new OrderManagerError(
        'Returned data does not match expected data shape',
      );
      Sentry.withScope((scope) => {
        scope.setExtras({ response, orderId, ref });
        Sentry.captureException(err);
      });
      err.isLogged = true;
      throw err;
    }
    return response.order.orderNumber;
  }

  async getCatererMenu({ catererId, ref }: { catererId: string; ref: string }) {
    const client = this.setAuthHeaderOnClient(this.client, ref);

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
    const response = await client.request(query).catch((reason) => {
      let message = 'GraphQL client request failed for queryOrderName';
      if (reason instanceof Error) {
        message = reason.message;
      } else if (typeof reason === 'string') {
        message = reason;
      }

      const err = new OrderManagerError(message);
      Sentry.withScope((scope) => {
        scope.setExtras({ arguments: { catererId, ref }, reason });
        Sentry.captureException(err);
      });
      throw err;
    });

    if (!isIGetH4HCatererMenu(response)) {
      const err = new OrderManagerError(
        'Returned data does not match expected data shape',
      );
      Sentry.withScope((scope) => {
        scope.setExtras({ arguments: { catererId, ref }, response });
        Sentry.captureException(err);
      });
      throw err;
    }
    return response;
  }
}
