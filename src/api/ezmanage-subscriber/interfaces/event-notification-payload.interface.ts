export interface IEventNotificationPayload {
  id: string;
  parent_type: string; // Expected value: 'Caterer'
  parent_id: string; // Expected as catererId
  entity_type: string; // Expected value: 'Order', could also be 'Menu'
  entity_id: string; // Expected as orderId, could also be 'menuId'
  key: string; // Expected in: 'accepted', 'cancelled', 'updated' (see below)
  occurred_at: string;
}

/**
 * For the key value, the 'updated' key should correspond solely to a menu update
 * 'cancelled' is when an order is cancelled
 * 'accepted' is when an order is accepted or an update is accepted
 */
