import { Injectable } from '@nestjs/common';
import { AccountDbHandlerService } from 'src/internal-modules/external-interface-handlers/database/account-db-handler/account-db-handler.service';
import { OrderDbHandlerService } from 'src/internal-modules/external-interface-handlers/database/order-db-handler/order-db-handler.service';
import { OrderService } from 'src/internal-modules/order/order.service';
import { CustomLoggerService } from 'src/support-modules/custom-logger/custom-logger.service';
import { EventNotificationPayloadKey } from './enums';

@Injectable()
export class EzmanageSubscriberInternalInterfaceService {
  constructor(
    private readonly orderService: OrderService,
    private readonly accountDbHandler: AccountDbHandlerService,
    private readonly orderDbHandler: OrderDbHandlerService,
    private readonly logger: CustomLoggerService,
  ) {}

  async handleWebhook({
    accountName,
    parent_id,
    entity_id,
    key,
    occurred_at,
  }: {
    accountName: string;
    parent_id: string;
    entity_id: string;
    key: EventNotificationPayloadKey;
    occurred_at: string;
  }) {
    /**
     * If here, parent_type is 'Caterer', entity_type is 'Order', and key is either 'accepted' or 'cancelled'
     * Thus, parent_id should be catererId, entityId should be orderId
     */
    const account = (await this.accountDbHandler.findByName(accountName)) as {
      id: string;
      authTokenPrefix: string;
    };

    /**
     * What if account isn't found
     */

    if (key === EventNotificationPayloadKey.CANCELLED)
      return this.handleOrderCancelled(entity_id);

    /**
     * If not cancelled, is accepted
     */
    return this.handleOrderAccepted({
      accountId: account.id,
      catererId: parent_id,
      orderId: entity_id,
      occurredAt: occurred_at,
      authTokenPrefix: account.authTokenPrefix,
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
    authTokenPrefix,
  }: {
    accountId: string;
    catererId: string;
    orderId: string;
    occurredAt: string;
    authTokenPrefix: string;
  }) {
    const order = await this.orderDbHandler.findOne(orderId);

    if (!order) {
      /**
       * Is new
       */
      await this.orderService.createOrder({
        accountId,
        catererId,
        orderId,
        occurredAt,
        authTokenPrefix,
      });
    } else {
      /**
       * Is not new
       */
    }
  }
}
