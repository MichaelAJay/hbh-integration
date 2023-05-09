import {
  BadRequestException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  EventNotificationPayloadEntityType,
  EventNotificationPayloadKey,
  EventNotificationPayloadParentType,
} from 'src/api/ezmanage-subscriber/enums';
import { IEventNotificationPayload } from '../../../interfaces';

export function EzManagePayloadValidator(payload: IEventNotificationPayload) {
  try {
    const { parent_type, parent_id, entity_type, entity_id, key, occurred_at } =
      payload;

    if (
      !(
        typeof parent_type === 'string' &&
        typeof parent_id === 'string' &&
        typeof entity_type === 'string' &&
        typeof entity_id === 'string' &&
        typeof key === 'string' &&
        typeof occurred_at === 'string'
      )
    )
      throw new BadRequestException('Invalid payload');

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
      throw new UnprocessableEntityException(msg);
    }
  } catch (err) {
    /**
     * @TODO in all cases, configure the error to pass back to the calling catch block
     */
    throw err;
  }
}
