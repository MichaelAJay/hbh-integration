export enum EventNotificationPayloadKey {
  ACCEPTED = 'accepted',
  CANCELLED = 'cancelled',
  UPDATED = 'updated',
}

/**
 * IMPLEMENTATION NOTES
 * 'updated' key should correspond solely to a menu update
 * ^^^ note: this one shouldn't be handled by this system as of 6 May '23
 * 'cancelled' is when an order is cancelled
 * 'accepted' is when an order is accepted or an update is accepted
 */
