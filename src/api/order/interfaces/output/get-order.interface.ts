import {
  IEzManageOrderEventAddress,
  IEzManageOrderEventContact,
  IEzManageOrderItemCustomization,
} from 'src/external-modules/ezmanage-api/interfaces/gql/responses';
import { UiOrderStatus } from '../../enums/output';

/**
 * @TODO should have OrderStatus
 */
export interface IGetOrderOutput {
  status: UiOrderStatus;
  orderNumber: string;
  catererName: string;
  event: {
    deliveryTime: Date;
    address: IEzManageOrderEventAddress | null;
    contact: IEzManageOrderEventContact | null;
  };
  contact: {
    firstName: string | null;
    lastName: string | null;
  };
  totals: {
    subTotal: number;
    catererTotalDue: number;
    tip: number;
    deliveryFee: number;
    commission: number;
  };
  items: IGetOrderOutputItem[];
  sourceType: string;
  itemsAggregate: { [key: string]: number };
}

export interface IGetOrderOutputItem {
  quantity: number;
  name: string;
  cost: number;
  customizations: IEzManageOrderItemCustomization[];
}
