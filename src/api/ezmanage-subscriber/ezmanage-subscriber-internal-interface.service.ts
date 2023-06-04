import { Injectable } from '@nestjs/common';
import { DbOrderStatus } from 'src/external-modules/database/enum';
import { AccountService } from 'src/internal-modules/account/account.service';
import { CatererDbHandlerService } from 'src/internal-modules/external-interface-handlers/database/caterer-db-handler/caterer-db-handler.service';
import { OrderDbHandlerService } from 'src/internal-modules/external-interface-handlers/database/order-db-handler/order-db-handler.service';
import { OrderService } from 'src/internal-modules/order/order.service';
import { CustomLoggerService } from 'src/support-modules/custom-logger/custom-logger.service';
import { EventNotificationPayloadKey } from './enums';

@Injectable()
export class EzmanageSubscriberInternalInterfaceService {
  constructor(
    private readonly accountService: AccountService,
    private readonly catererDbHandler: CatererDbHandlerService,
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
    const { account, caterer } =
      await this.accountService.findAccountByCatererId(catererId);
    if (key === EventNotificationPayloadKey.CANCELLED)
      return this.handleOrderCancelled({
        accountId: account.id,
        catererId,
        catererName: caterer.name,
        orderId: orderId,
        occurredAt: occurred_at,
        ref: account.ref,
      });

    /**
     * If not cancelled, is accepted
     */
    return this.handleOrderAccepted({
      accountId: account.id,
      catererId,
      catererName: caterer.name,
      orderId: orderId,
      occurredAt: occurred_at,
      ref: account.ref,
    });
  }

  private async handleOrderCancelled({
    accountId,
    catererId,
    orderId,
    occurredAt,
    ref,
    catererName,
  }: {
    accountId: string;
    catererId: string;
    orderId: string;
    occurredAt: string;
    ref: string;
    catererName: string;
  }) {
    /**
     * Business logic:
     * These should be entered into Nutshell CRM
     */
    const order = await this.orderDbHandler.getOne(orderId);

    /**
     * If order, change status to "Cancelled" and start cancellation process.
     * If !order, create Order with "Cancelled" status & start cancellation process
     */
    if (!order) {
      await this.orderService.createOrder({
        accountId,
        catererId,
        catererName,
        orderId,
        status: DbOrderStatus.CANCELLED,
        occurredAt,
        ref,
      });
    }

    if (order && order.status === DbOrderStatus.ACCEPTED) {
      await this.orderDbHandler.updateOne({
        orderId,
        updates: { status: DbOrderStatus.CANCELLED },
      });
    }

    /**
     * Do I want to do the update from the orderDbHandler or through the OrderService?
     * Typically, if it's a single operation, going through the db handler is fine.
     * And now the Order status has been updated and we can proceed with the role of the
     * api controller & related providers, which is to control the process of handling the "Cancelled" event
     *
     * The next thing to do in the "Cancelled" event is to prepare for the Nutshell integration
     */
    await this.orderService.handleCancelledOrder(orderId);
  }

  /**
   * This handles order accepted events, which include
   * 1) Initial acceptance
   * 2) Order update acceptance
   *
   * @TODO need to think through process of "Accepted" after "Cancelled" - is that possible?
   */
  private async handleOrderAccepted({
    accountId,
    catererId,
    catererName,
    orderId,
    occurredAt,
    ref,
  }: {
    accountId: string;
    catererId: string;
    catererName: string;
    orderId: string;
    occurredAt: string;
    ref: string;
  }) {
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
        status: DbOrderStatus.ACCEPTED,
        occurredAt,
        ref,
        catererName,
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
