import {
  IEzManageOrderEventAddress,
  IEzManageOrderEventContact,
} from 'src/external-modules/ezmanage-api/interfaces/gql/responses';

export interface IGetOrderOutput {
  orderNumber: string;
  catererName: string;
  event: {
    deliveryTime: Date;
    address: IEzManageOrderEventAddress;
    contact: IEzManageOrderEventContact;
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
  items: {
    quantity: number;
    name: string;
    cost: number;
  }[];
  sourceType: string;
}
