import { Injectable, NotFoundException } from '@nestjs/common';
import {
  IGetOrderOutput,
  IGetOrderOutputItem,
} from 'src/api/order/interfaces/output';
import { OrderStatus } from 'src/external-modules/database/enum';
import {
  IOrderModel,
  IOrderModelWithId,
} from 'src/external-modules/database/models';
import { IEzManageOrder } from 'src/external-modules/ezmanage-api/interfaces/gql/responses';
import { CustomLoggerService } from 'src/support-modules/custom-logger/custom-logger.service';
import { OrderDbHandlerService } from '../external-interface-handlers/database/order-db-handler/order-db-handler.service';
import { EzmanageApiHandlerService } from '../external-interface-handlers/ezmanage-api/ezmanage-api-handler.service';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderDbService: OrderDbHandlerService,
    private readonly ezManageApiHandler: EzmanageApiHandlerService,
    private readonly logger: CustomLoggerService,
  ) {}

  async createOrder({
    accountId,
    catererId,
    orderId,
    status,
    occurredAt,
    ref,
    catererName,
  }: {
    accountId: string;
    catererId: string;
    orderId: string;
    status: OrderStatus;
    occurredAt: string;
    ref: string;
    catererName: string;
  }) {
    /**
     * Need order name for db
     */
    /**
     * @TODO add request to check for order name
     */
    const ezManageOrderName = await this.ezManageApiHandler
      .getOrderName({
        orderId,
        ref,
      })
      .catch((reason) => {
        const msg = 'Failed to retrieve order name';
        this.logger.error(msg, reason);
      });

    /**
     * @TODO fix the date issue
     */
    const now = new Date();
    const data: IOrderModel = {
      accountId,
      catererId,
      catererName,
      name: ezManageOrderName || 'PLACEHOLDER NAME',
      status,
      acceptedAt: now,
      lastUpdatedAt: now,
    };

    await this.orderDbService.create({ orderId, data });
    return;
  }

  async handleCancelledOrder(orderId: string) {
    /**
     * This should interface with the Nutshell API and do some undetermined number of things
     */
    return;
  }

  async doesOrderBelongToAccount({
    input,
    accountId,
  }: {
    input: string | IOrderModelWithId;
    accountId: string;
  }) {
    const order =
      typeof input === 'string'
        ? await this.orderDbService.getOne(input)
        : input;

    if (!order) throw new NotFoundException();

    // console.log('Order ID: ', order.id);
    return order.accountId === accountId;
  }

  async getOrder({ orderId, ref }: { orderId: string; ref: string }) {
    const order = await this.ezManageApiHandler.getOrder({
      orderId,
      ref,
    });

    return this.convertEzManageOrderForOutput(order);
  }

  async getOrderName({ orderId, ref }: { orderId: string; ref: string }) {
    return this.ezManageApiHandler.getOrderName({
      orderId,
      ref,
    });
  }

  private convertEzManageOrderForOutput(
    order: IEzManageOrder,
  ): Omit<IGetOrderOutput, 'catererName'> {
    // Extract the delivery fee (in cents)
    let deliveryFeeInCents = 0;
    for (const fee of order.catererCart.feesAndDiscounts) {
      if (fee.name === 'Delivery Fee') {
        deliveryFeeInCents = fee.cost.subunits;
        break;
      }
    }

    const subTotalInCents = order.totals.subTotal.subunits;
    const catererTotalDueInCents =
      order.catererCart.totals.catererTotalDue * 100;
    const tipInCents = order.totals.tip.subunits;

    // Stubbed commission (in cents)
    const commissionInCents =
      catererTotalDueInCents -
      (subTotalInCents + deliveryFeeInCents + tipInCents);

    function centsToDollars(cents: number): number {
      return Number((cents / 100).toFixed(2));
    }

    const items = order.catererCart.orderItems.map((item) => ({
      quantity: item.quantity,
      name: item.name,
      cost: centsToDollars(item.totalInSubunits.subunits),
    }));

    return {
      orderNumber: order.orderNumber,
      sourceType: order.orderSourceType,
      event: {
        deliveryTime: new Date(order.event.timestamp),
        address: order.event.address,
        contact: order.event.contact,
      },
      contact: {
        firstName: order.orderCustomer.firstName,
        lastName: order.orderCustomer.lastName,
      },
      totals: {
        subTotal: centsToDollars(subTotalInCents),
        catererTotalDue: order.catererCart.totals.catererTotalDue,
        tip: centsToDollars(tipInCents),
        deliveryFee: centsToDollars(deliveryFeeInCents),
        commission: centsToDollars(commissionInCents),
      },
      items,
      itemsAggregate: this.aggregateOrder(items),
    };
  }

  private aggregateOrder(items: IGetOrderOutputItem[]) {
    const itemsAggregate: { [key: string]: number } = {};
    for (const item of items) {
      if (itemsAggregate[item.name]) {
        itemsAggregate[item.name] += item.quantity;
      } else {
        itemsAggregate[item.name] = item.quantity;
      }
    }
    return itemsAggregate;
  }
}
