import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { CustomLoggerService } from 'src/support-modules/custom-logger/custom-logger.service';

import {
  EventNotificationPayloadEntityType,
  EventNotificationPayloadKey,
  EventNotificationPayloadParentType,
} from './enums';
import { IEventNotificationPayload } from './interfaces';
import { EzmanageSubscriberInternalInterfaceService } from './ezmanage-subscriber-internal-interface.service';

@Injectable()
export class EzmanageSubscriberService {
  constructor(
    private readonly ezManageInternalInterface: EzmanageSubscriberInternalInterfaceService,
    private readonly customLogger: CustomLoggerService,
  ) {}

  async handleWebhook(accountId, payload: IEventNotificationPayload) {
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

      await this.ezManageInternalInterface.handleWebhook({
        accountId,
        parent_id,
        entity_id,
        key,
        occurred_at,
      });
    } catch (err) {
      console.error('err', err);
      throw err;
    }
  }
}

/**
 * Order looks like:
 * id
 *
 */
