import { Injectable } from '@nestjs/common';
import { DbOrderStatus } from 'src/external-modules/database/enum';
import { IAccountModelWithId } from 'src/external-modules/database/models';
import { AccountService } from 'src/internal-modules/account/account.service';
import { OrderDbHandlerService } from 'src/internal-modules/external-interface-handlers/database/order-db-handler/order-db-handler.service';
import { OrderService } from 'src/internal-modules/order/order.service';
import { EventNotificationPayloadKey } from './enums';

@Injectable()
export class EzmanageSubscriberInternalInterfaceService {
  constructor(
    private readonly accountService: AccountService,
    private readonly orderService: OrderService,
    private readonly orderDbHandler: OrderDbHandlerService,
  ) {}

  /**
   * PRECONDITIONS:
   * 1) parent_id references a Caterer
   * 2) entity_id is an EzManage Order UUID
   * 3) key is either 'accepted' or 'cancelled'
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
        account,
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
      account,
      catererId,
      catererName: caterer.name,
      orderId: orderId,
      occurredAt: occurred_at,
    });
  }

  async handleOrderCancelled({
    account,
    catererId,
    orderId,
    occurredAt,
    ref,
    catererName,
  }: {
    account: IAccountModelWithId;
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
        account,
        catererId,
        catererName,
        orderId,
        status: DbOrderStatus.CANCELLED,
        occurredAt,
      });
    }

    if (order && order.status === DbOrderStatus.ACCEPTED) {
      await this.orderDbHandler.updateOne({
        orderId,
        updates: { status: DbOrderStatus.CANCELLED },
      });
    }

    await this.orderService.handleCancelledOrder(orderId);
  }

  /**
   * This handles order accepted events, which include
   * 1) Initial acceptance
   * 2) Order update acceptance
   *
   * @TODO need to think through process of "Accepted" after "Cancelled" - is that possible?
   */
  async handleOrderAccepted({
    account,
    catererId,
    catererName,
    orderId,
    occurredAt,
  }: {
    account: IAccountModelWithId;
    catererId: string;
    catererName: string;
    orderId: string;
    occurredAt: string;
  }) {
    const order = await this.orderDbHandler.getOne(orderId);
    if (!order) {
      /**
       * Is new
       */
      await this.orderService.createOrder({
        account,
        catererId,
        orderId,
        status: DbOrderStatus.ACCEPTED,
        occurredAt,
        catererName,
      });
    } else {
      await this.orderService.updateOrder({
        account,
        catererId,
        occurredAt,
        catererName,
        internalOrder: order,
      });
    }
  }
}
