import {
  EventNotificationPayloadEntityType,
  EventNotificationPayloadKey,
  EventNotificationPayloadParentType,
} from '../enums';

export interface IEventNotificationPayload {
  parent_type: EventNotificationPayloadParentType.CATERER;
  parent_id: string;
  entity_type: EventNotificationPayloadEntityType.ORDER;
  entity_id: string;
  key: EventNotificationPayloadKey;
  occurred_at: string;
}

/**
 * For the key value, the 'updated' key should correspond solely to a menu update
 * 'cancelled' is when an order is cancelled
 * 'accepted' is when an order is accepted or an update is accepted
 */
