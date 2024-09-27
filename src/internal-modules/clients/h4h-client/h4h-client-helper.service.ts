import { Injectable } from '@nestjs/common';
import {
  IEzManageOrder,
  IEzManageOrderItem,
} from 'src/external-modules/ezmanage-api/interfaces/gql/responses';
import { IProductEntity } from 'src/external-modules/nutshell-api/interfaces/entities';
import { retrieveCrmNameFromOrderSourceType } from 'src/internal-modules/external-interface-handlers/crm/accounts/H4H/constants';
import {
  ProductMap_H4H,
  AddOnMap,
} from 'src/internal-modules/external-interface-handlers/crm/accounts/H4H/utility';
import { ADD_ON_TARGET_CUSTOMIZATION_TYPE_NAMES } from 'src/internal-modules/external-interface-handlers/crm/accounts/H4H/utility/constants';
import { AccountRecordWithId } from 'src/internal-modules/external-interface-handlers/database/account-db-handler/types';

interface ResultObject {
  [key: number]: number;
}

@Injectable()
export class H4HClientHelperService {
  aggregateLeadProducts(items: IEzManageOrderItem[]): {
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
        } = this.handleSaladBoxedLunch(item);

        for (const property in saladAggregator) {
          aggregator[property] = saladAggregator[property];
        }

        invalidKeys.push(...customizationInvalidKeys);
        continue;
      }

      const id = this.mapH4HMenuItemToCrmProductId(
        item.name as keyof typeof ProductMap_H4H,
      );
      if (id !== undefined) {
        aggregator[id] = (aggregator[id] || 0) + item.quantity;
      } else {
        invalidKeys.push(item.name);
      }

      /**
       * Handle add-ons in customization
       */
      if (Array.isArray(item.customizations)) {
        for (const customization of item.customizations) {
          if (
            ADD_ON_TARGET_CUSTOMIZATION_TYPE_NAMES.includes(
              customization.customizationTypeName,
            )
          ) {
            const id = this.mapH4HAddOnToCRMProductId(
              customization.customizationTypeName as keyof typeof AddOnMap,
            );
            if (
              id !== undefined &&
              typeof customization.quantity === 'number'
            ) {
              aggregator[id] = (aggregator[id] || 0) + customization.quantity;
            } else {
              invalidKeys.push(item.name);
            }
          } else {
            /**
             * What, if anything, does this need to do?
             */
          }
        }
      }
    }

    const leadProducts: IProductEntity[] = [];
    for (const property in aggregator) {
      leadProducts.push({ id: property, quantity: aggregator[property] });
    }
    return { leadProducts, invalidKeys };
  }

  handleSaladBoxedLunch(item: IEzManageOrderItem) {
    const aggregator: ResultObject = {};
    const invalidKeys: string[] = [];
    const saladKeys: string[] = [];

    for (const customization of item.customizations) {
      if (customization.customizationTypeName === 'Salad') {
        const menuItem = `${customization.name} - Boxed Lunch`;
        const id = this.mapH4HMenuItemToCrmProductId(
          menuItem as keyof typeof ProductMap_H4H,
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

  mapH4HMenuItemToCrmProductId(
    menuItem: keyof typeof ProductMap_H4H,
    // ): number | undefined {
  ): string | undefined {
    if (ProductMap_H4H[menuItem]) return ProductMap_H4H[menuItem].id;
    else return undefined;
  }

  mapH4HAddOnToCRMProductId(addOn: keyof typeof AddOnMap): string | undefined {
    const menuItem = AddOnMap[addOn];
    return menuItem
      ? this.mapH4HMenuItemToCrmProductId(
          menuItem as keyof typeof ProductMap_H4H,
        )
      : undefined;
  }

  getLeadName(order: IEzManageOrder): string | undefined {
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
    )} ${this.getDateForLeadName(timestamp)} ${city}`;
  }

  getDateForLeadName(timestamp: string): string {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '<DATE N/A>';

    const day = String(date.getDate());
    const month = String(date.getMonth() + 1); // Months are 0-based in JavaScript
    const year = String(date.getFullYear()).slice(-2); // Get the last 2 digits of the year
    return `${month}/${day}/${year}`;
  }

  getLeadAssignee({
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
}
