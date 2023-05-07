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
      const { parent_type, entity_type, key } = payload;
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

      if (key === EventNotificationPayloadKey.CANCELLED)
        return this.handleOrderCancelled();

      /**
       * Should be order accepted
       */
      return this.handleOrderAccepted();
    } catch (err) {
      console.error('err', err);
      throw err;
    }
  }

  private async handleOrderAccepted() {}

  private async handleOrderCancelled() {}
}
