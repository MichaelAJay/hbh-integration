import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import {
  EventNotificationPayloadEntityType,
  EventNotificationPayloadKey,
  EventNotificationPayloadParentType,
} from './enums';
import { IEventNotificationPayload } from './interfaces';

@Injectable()
export class EzmanageSubscriberService {
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
         * System should only be configured to accepted Order event notifications
         * Note:  We should really log this as well
         */
        const info = {
          entity_type,
          event_type: key,
        };

        throw new UnprocessableEntityException(
          "System is only configured to accept Order event notifications 'accepted' and 'cancelled'",
        );
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
     * Delete from system
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
  }
}
