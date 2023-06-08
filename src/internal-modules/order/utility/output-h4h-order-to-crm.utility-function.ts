import {
  IGetOrderOutput,
  IGetOrderOutputItem,
} from 'src/api/order/interfaces/output';
import { mapH4HMenuItemToCrmProductId, ProductMap } from '../mappers';

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
  /**
   * Trying without adding price first, hoping Nutshell does it automatically
   */
  //   price: {
  //     currency_shortname: 'USD';
  //     amount: string; // e.g. '49.99'
  //   };
}

/**
 * 6 June 2023
 * Outputs to a Nutshell Lead
 */
export function outputH4HOrderToCrm(
  order: Omit<IGetOrderOutput, 'catererName'>,
) {
  try {
    const { leadProducts: products, invalidKeys } = aggregateLeadProducts(
      order.items,
    );
    return { lead: { products }, invalidKeys };
  } catch (err) {
    console.error('Order to CRM Lead failed', err);
    throw err;
  }
}

function aggregateLeadProducts(items: IGetOrderOutputItem[]): {
  leadProducts: LeadProduct[];
  invalidKeys: string[];
} {
  interface ResultObject {
    [key: number]: number;
  }

  const aggregator: ResultObject = {};
  const invalidKeys: string[] = [];

  for (const item of items) {
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
