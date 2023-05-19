import { UUID } from 'src/common/types';

export interface IEzManageOrder {
  orderNumber: string;
  uuid: UUID;
  event: IEzManageOrderEvent;
  orderCustomer: IEzManageOrderCustomer;
  totals: IEzManageOrderTotals;
  catererCart: ICatererCart;
}

interface IEzManageOrderEvent {
  timestamp: string;
  timeZoneOffset: string;
}

interface IEzManageOrderCustomer {
  firstName: string | null;
  lastName: string | null;
}

interface IEzManageOrderTotals {
  subTotal: ISubunits;
  tip: ISubunits;
}

interface ISubunits {
  subunits: number;
}

interface ICatererCart {
  feesAndDiscounts: IFeeAndDiscount[];
  orderItems: IEzManageOrderItem[];
  totals: IEzManageOrderCatererTotals;
}

interface IFeeAndDiscount {
  name: string;
  cost: ISubunits;
}

interface IEzManageOrderItem {
  quantity: number;
  name: string;
  totalInSubunits: ISubunits;
}

interface IEzManageOrderCatererTotals {
  catererTotalDue: number;
}
