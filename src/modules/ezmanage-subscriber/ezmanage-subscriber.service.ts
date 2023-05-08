import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { CustomLoggerService } from 'src/support-modules/custom-logger/custom-logger.service';
import { DatabaseClientService } from 'src/support-modules/database/database-client.service';
import { CollectionName } from 'src/support-modules/database/enum';
import { EzmanageApiService } from 'src/support-modules/ezmanage-api/ezmanage-api.service';
import { OrderDbService } from '../order/order-db.service';
import {
  EventNotificationPayloadEntityType,
  EventNotificationPayloadKey,
  EventNotificationPayloadParentType,
} from './enums';
import { IEventNotificationPayload } from './interfaces';

@Injectable()
export class EzmanageSubscriberService {
  constructor(
    private readonly ezManageApiService: EzmanageApiService,
    private readonly dbClientService: DatabaseClientService,
    private readonly customLogger: CustomLoggerService,
    private readonly orderDbService: OrderDbService,
  ) {}

  async handleWebhook(payload: IEventNotificationPayload) {
    try {
      const {
        parent_type,
        parent_id,
        entity_type,
        entity_id,
        key,
        occurred_at,
      } = payload;
      /**
       * Note:
       * If the "Menu Updated" subscription isn't required for this system,
       * then we should confirm that 'entity-type' is 'order'
       */
      if (
        !(
          parent_type === EventNotificationPayloadParentType.CATERER &&
          entity_type === EventNotificationPayloadEntityType.ORDER &&
          (key === EventNotificationPayloadKey.ACCEPTED ||
            key === EventNotificationPayloadKey.CANCELLED)
        )
      ) {
        /**
         * System is configured to accept:
         * parent type Caterer
         * entity type Order
         * AND key in ['accepted', 'cancelled']
         */
        const msg = `System received parent type: ${parent_type}; entity type: ${entity_type}, key: ${key} `;
        const info = {
          entity_type,
          event_type: key,
        };
        this.customLogger.error(msg, info);
        throw new UnprocessableEntityException(msg);
      }

      /**
       * If here, parent_type is 'Caterer', entity_type is 'Order', and key is either 'accepted' or 'cancelled'
       * Thus, parent_id should be catererId, entityId should be orderId
       */

      if (key === EventNotificationPayloadKey.CANCELLED)
        return this.handleOrderCancelled(entity_id);

      /**
       * Should be order accepted
       */
      return this.handleOrderAccepted({
        catererId: parent_id,
        orderId: entity_id,
        occurredAt: occurred_at,
      });
    } catch (err) {
      console.error('err', err);
      throw err;
    }
  }

  private async handleOrderCancelled(orderId: string) {
    /**
     * Business logic:
     * These should be entered into Nutshell CRM
     */
  }

  /**
   * This handles order accepted events, which include
   * 1) Initial acceptance
   * 2) Order update acceptance
   */
  private async handleOrderAccepted({
    catererId,
    orderId,
    occurredAt,
  }: {
    catererId: string;
    orderId: string;
    occurredAt: string;
  }) {
    /**
     * Is orderId in system?
     *
     * If not:
     * Make GraphQL query to confirm that order is not completed
     * If order is not completed, add it to DB
     *
     * If so:
     * Make GraphQL query to check order details
     * Is order completed?  Then ready to
     */
    const order = await this.orderDbService.findOne(orderId);

    if (!order) {
      /**
       * Is new
       */
      /**
       * May not even need to get.  Although we may need data like caterer, etc...
       */
      const ezManageOrder = await this.ezManageApiService.getOrder(orderId);
    } else {
      /**
       * Is not new
       */
    }
  }
}

/**
 * Order looks like:
 * id
 *
 */
