import { ConvertCentsToDollarsAndCents } from 'src/common/utility';
import { DbOrderStatus } from 'src/external-modules/database/enum';
import { IEzManageOrder } from 'src/external-modules/ezmanage-api/interfaces/gql/responses';
import { ConvertOrderStatusDbToUi } from 'src/internal-modules/order/converters';
import { IGetOrderOutput, IGetOrderOutputItem } from '../interfaces/output';

export function convertEzManageOrderForOutput(
  order: IEzManageOrder & { status: DbOrderStatus },
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
  const catererTotalDueInCents = order.catererCart.totals.catererTotalDue * 100;
  const tipInCents = order.totals.tip.subunits;

  // Stubbed commission (in cents)
  const commissionInCents =
    catererTotalDueInCents -
    (subTotalInCents + deliveryFeeInCents + tipInCents);

  const items = order.catererCart.orderItems.map((item) => ({
    quantity: item.quantity,
    name: item.name,
    cost: ConvertCentsToDollarsAndCents(item.totalInSubunits.subunits),
    customizations: item.customizations,
  }));

  return {
    status: ConvertOrderStatusDbToUi({
      status: order.status,
      dueTime: order.event.timestamp,
    }),
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
      subTotal: ConvertCentsToDollarsAndCents(subTotalInCents),
      catererTotalDue: order.catererCart.totals.catererTotalDue,
      tip: ConvertCentsToDollarsAndCents(tipInCents),
      deliveryFee: ConvertCentsToDollarsAndCents(deliveryFeeInCents),
      commission: ConvertCentsToDollarsAndCents(commissionInCents),
    },
    items,
    itemsAggregate: aggregateOrder(items),
  };
}
function aggregateOrder(items: IGetOrderOutputItem[]) {
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

export function getH4HCommissionInCents(order: IEzManageOrder): number {
  let deliveryFeeInCents = 0;
  for (const fee of order.catererCart.feesAndDiscounts) {
    if (fee.name === 'Delivery Fee') {
      deliveryFeeInCents = fee.cost.subunits;
      break;
    }
  }

  const subTotalInCents = order.totals.subTotal.subunits;
  const catererTotalDueInCents = order.catererCart.totals.catererTotalDue * 100;
  const tipInCents = order.totals.tip.subunits;

  // Stubbed commission (in cents)
  const commissionInCents =
    catererTotalDueInCents -
    (subTotalInCents + deliveryFeeInCents + tipInCents);

  return commissionInCents;
}
