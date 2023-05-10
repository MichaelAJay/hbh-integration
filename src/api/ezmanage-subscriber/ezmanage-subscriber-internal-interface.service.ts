import { Injectable } from '@nestjs/common';
import { AccountService } from 'src/internal-modules/account/account.service';
import { OrderDbHandlerService } from 'src/internal-modules/external-interface-handlers/database/order-db-handler/order-db-handler.service';
import { OrderService } from 'src/internal-modules/order/order.service';
import { CustomLoggerService } from 'src/support-modules/custom-logger/custom-logger.service';
import { EventNotificationPayloadKey } from './enums';

@Injectable()
export class EzmanageSubscriberInternalInterfaceService {
  constructor(
    private readonly accountService: AccountService,
    private readonly orderService: OrderService,
    private readonly orderDbHandler: OrderDbHandlerService,
    private readonly logger: CustomLoggerService,
  ) {}

  /**
   * PRECONDITIONS:
   * 1) parent_id references a Caterer
   * 2) entity_id is an EzManage Order UUID
   * 3) key is either 'accepted' or 'cancelled'
   * @param param0
   * @returns
   */
  async handleWebhook({
    catererId,
    orderId,
    key,
    occurred_at,
  }: {
    catererId: string;
    orderId: string;
    key: EventNotificationPayloadKey;
    occurred_at: string;
  }) {
    const account = await this.accountService.findAccountByCatererId(catererId);
    if (key === EventNotificationPayloadKey.CANCELLED)
      return this.handleOrderCancelled(orderId);

    /**
     * If not cancelled, is accepted
     */
    /**
     * @START
     */
    return this.handleOrderAccepted({
      accountId: account.id,
      catererId,
      orderId: orderId,
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
    /**
     * Actually need to catch here
     */
    const order = await this.orderDbHandler.getOne(orderId);
    console.log('looked for one');
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
      console.log('made one');
    } else {
      /**
       * Is not new
       */
      console.log('found one', order);
    }
  }
}
