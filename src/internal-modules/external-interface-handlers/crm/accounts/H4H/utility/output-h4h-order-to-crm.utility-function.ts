import { getH4HCommissionInCents } from 'src/api/order/utility';
import { ConvertCentsToDollarsAndCents } from 'src/common/utility';
import {
  IEzManageOrder,
  IEzManageOrderItem,
} from 'src/external-modules/ezmanage-api/interfaces/gql/responses';
import { IProductEntity } from 'src/external-modules/nutshell-api/interfaces/entities';
import { IUpsertLeadEntity } from 'src/external-modules/nutshell-api/interfaces/requests';
import { AccountRecordWithId } from 'src/internal-modules/external-interface-handlers/database/account-db-handler/types';
import { FormatOrderName, mapH4HMenuItemToCrmProductId, ProductMap } from '.';
import {
  retrieveCrmNameFromOrderSourceType,
  retrievePipelineIdFromOrderSourceType,
} from '../constants';
import { IH4HCreateLeadCustomFields } from '../interfaces';

/**
 * @TODO move this
 */

/**
 * This interface is from an email from Nutshell
 * May check against API to see if there are any other fields to add
 */
export interface LeadOutput {
  lead: {
    // assignee: { entityType: 'Users'; id: number };
    products: IProductEntity[];
    // sources: { id: number }[];
  };
}

export function outputH4HOrderToCrm({
  order,
  account,
}: {
  order: IEzManageOrder;
  account: AccountRecordWithId;
}) {
  try {
    const { leadProducts: products, invalidKeys } = aggregateLeadProducts(
      order.catererCart.orderItems,
    );

    const id = mapH4HMenuItemToCrmProductId('EZCater/EZOrder Commission');
    if (id) {
      const commissionInCents = getH4HCommissionInCents(order);
      const commission = ConvertCentsToDollarsAndCents(commissionInCents);
      products.push({
        id,
        quantity: 1,
        price: { currency_shortname: 'USD', amount: commission.toString() },
      });
    }

    const lead: IUpsertLeadEntity<IH4HCreateLeadCustomFields> = {
      products,
      description: getLeadName(order),
      customFields: {
        'Lead description': `This lead was generated from the EzManage order ${FormatOrderName(
          order.orderNumber,
        )}`,
      },
    };

    const stagesetId = retrievePipelineIdFromOrderSourceType(
      order.orderSourceType,
    );
    if (stagesetId) {
      lead.stagesetId = stagesetId;
    }

    const assignee = getLeadAssignee({ order, account });
    if (assignee) {
      lead.assignee = { ...assignee };
    }

    return { lead, invalidKeys };
  } catch (err) {
    console.error('Order to CRM Lead failed', err);
    throw err;
  }
}

interface ResultObject {
  [key: number]: number;
}

function aggregateLeadProducts(items: IEzManageOrderItem[]): {
  leadProducts: IProductEntity[];
  invalidKeys: string[];
} {
  const aggregator: ResultObject = {};
  const invalidKeys: string[] = [];

  for (const item of items) {
    if (item.name === 'Salad Boxed Lunches') {
      const {
        aggregator: saladAggregator,
        invalidKeys: customizationInvalidKeys,
      } = handleSaladBoxedLunch(item);

      for (const property in saladAggregator) {
        aggregator[property] = saladAggregator[property];
      }

      invalidKeys.push(...customizationInvalidKeys);
      continue;
    }

    const id = mapH4HMenuItemToCrmProductId(
      item.name as keyof typeof ProductMap,
    );
    if (id !== undefined) {
      aggregator[id] = (aggregator[id] || 0) + item.quantity;
    } else {
      invalidKeys.push(item.name);
    }
  }

  const leadProducts: IProductEntity[] = [];
  for (const property in aggregator) {
    leadProducts.push({ id: property, quantity: aggregator[property] });
  }
  return { leadProducts, invalidKeys };
}

function handleSaladBoxedLunch(item: IEzManageOrderItem) {
  const aggregator: ResultObject = {};
  const invalidKeys: string[] = [];
  const saladKeys: string[] = [];

  for (const customization of item.customizations) {
    if (customization.customizationTypeName === 'Salad') {
      const menuItem = `${customization.name} - Boxed Lunch`;
      const id = mapH4HMenuItemToCrmProductId(
        menuItem as keyof typeof ProductMap,
      );

      if (id !== undefined) {
        aggregator[id] = (aggregator[id] || 0) + customization.quantity;
      } else {
        invalidKeys.push();
      }
      /**
       * Used in exception handling
       */
      saladKeys.push(menuItem);
    }
  }

  let customizationAggregateQuantity = 0;
  for (const property in aggregator) {
    customizationAggregateQuantity += aggregator[property];
  }

  if (item.quantity !== customizationAggregateQuantity) {
    /**
     * @TODO this shouldn't trash the whole process.
     * Should log probably
     */
    return { aggregator: {}, invalidKeys: saladKeys };
  }

  return { aggregator, invalidKeys };
}

function getLeadName(order: IEzManageOrder): string | undefined {
  const { event, caterer, orderSourceType } = order;
  const { timestamp } = event;
  const { address } = caterer;
  const { city: addressCity } = address;
  let city = 'CITY';
  switch (addressCity) {
    case 'Athens':
      city = 'Athens';
      break;
    case 'Gainesville':
      city = 'Gville';
      break;
  }
  return `${retrieveCrmNameFromOrderSourceType(
    orderSourceType,
  )} ${getDateForLeadName(timestamp)} ${city}`;
}

function getDateForLeadName(timestamp: string): string {
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return '<DATE N/A>';

  const day = String(date.getDate());
  const month = String(date.getMonth() + 1); // Months are 0-based in JavaScript
  const year = String(date.getFullYear()).slice(-2); // Get the last 2 digits of the year
  return `${month}/${day}/${year}`;
}

function getLeadAssignee({
  order,
  account,
}: {
  order: IEzManageOrder;
  account: AccountRecordWithId;
}): { entityType: 'Users'; id: number } | undefined {
  if (!Array.isArray(account.crmUsers)) return undefined;

  const { caterer } = order;
  const { address } = caterer;
  const { city } = address;
  const assignee = account.crmUsers.find((user) => user.assignFor === city);
  return assignee ? { entityType: 'Users', id: assignee.id } : undefined;
}

export function compareEzManageSubtotalToCrmSubtotal({
  order,
  products,
}: {
  order: IEzManageOrder;
  products: { amountInUsd: number }[];
}) {
  const crmSubtotal = products.reduce((acc, cur) => {
    acc += cur.amountInUsd;
    return acc;
  }, 0);

  const ezManageSubtotal = ConvertCentsToDollarsAndCents(
    order.totals.subTotal.subunits,
  );

  return (
    ezManageSubtotal - crmSubtotal < 0.01 ||
    crmSubtotal - ezManageSubtotal < 0.01
  );
}
