import { getH4HCommissionInCents } from 'src/api/order/utility';
import { ConvertCentsToDollarsAndCents } from 'src/common/utility';
import {
  IEzManageOrder,
  IEzManageOrderItem,
} from 'src/external-modules/ezmanage-api/interfaces/gql/responses';
import { mapH4HMenuItemToCrmProductId, ProductMap } from '.';

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
    products: LeadProduct[];
    // sources: { id: number }[];
  };
}

export interface LeadProduct {
  id: string; // note: is string in email correspondence, but is number in return from Nutshell product list
  quantity: number;
  price?: {
    currency_shortname: 'USD';
    amount: string; // e.g. '49.99'
  };
}

/**
 * 6 June 2023
 * Outputs to a Nutshell Lead
 *
 * @TODO
 * lead.name
 * if (marketplace) 'EZCater MM/DD/YY (Gville/Athens)' date is delivery date
 * if (ez ordering) 'EZOrder MM/DD/YY (Gville/Athens)'
 */
export function outputH4HOrderToCrm(order: IEzManageOrder) {
  try {
    const { leadProducts: products, invalidKeys } = aggregateLeadProducts(
      order.catererCart.orderItems,
    );

    const commissionInCents = getH4HCommissionInCents(order);
    const commission = ConvertCentsToDollarsAndCents(commissionInCents);
    const id = mapH4HMenuItemToCrmProductId('EZCater/EZOrder Commission');
    if (id) {
      products.push({
        id,
        quantity: 1,
        price: { currency_shortname: 'USD', amount: commission.toString() },
      });
    }

    const name = getLeadName(order);

    const lead = {
      products,
      name: name || 'REPLACE',
    };

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
  leadProducts: LeadProduct[];
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

  const leadProducts: LeadProduct[] = [];
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
  const { city } = address;
  if (!(city === 'Athens' || city === 'Gainesville')) return undefined;

  /**
   * TRYING
   */
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return undefined;

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based in JavaScript
  const year = String(date.getFullYear()).slice(-2); // Get the last 2 digits of the year

  /** Convert orderSourceType */
  return `${orderSourceType} ${day}/${month}/${year} ${
    city === 'Athens' ? city : 'Gville'
  }`;
}
