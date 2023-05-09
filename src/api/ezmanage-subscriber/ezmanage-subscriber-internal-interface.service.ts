import { Injectable } from '@nestjs/common';
import { OrderDbHandlerService } from 'src/internal-modules/external-interface-handlers/database/order-db-handler/order-db-handler.service';
import { EzmanageApiHandlerService } from 'src/internal-modules/external-interface-handlers/ezmanage-api/ezmanage-api-handler.service';
import { EventNotificationPayloadKey } from './enums';

@Injectable()
export class EzmanageSubscriberInternalInterfaceService {
  constructor(
    private readonly orderDbHandler: OrderDbHandlerService,
    private readonly ezManageApiHandler: EzmanageApiHandlerService,
  ) {}

  async handleWebhook({
    accountId,
    parent_id,
    entity_id,
    key,
    occurred_at,
  }: {
    accountId: string;
    parent_id: string;
    entity_id: string;
    key: EventNotificationPayloadKey;
    occurred_at: string;
  }) {
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
      accountId,
      catererId: parent_id,
      orderId: entity_id,
      occurredAt: occurred_at,
    });
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
    accountId,
    catererId,
    orderId,
    occurredAt,
  }: {
    accountId: string;
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
    const order = await this.orderDbHandler.findOne(orderId);

    if (!order) {
      /**
       * Is new
       */
      /**
       * May not even need to get.  Although we may need data like caterer, etc...
       */
      const ezManageOrder = await this.ezManageApiHandler.getOrder(orderId);
    } else {
      /**
       * Is not new
       */
    }
  }
}
