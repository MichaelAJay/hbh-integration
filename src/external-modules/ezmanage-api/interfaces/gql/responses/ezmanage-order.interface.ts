import { UUID } from 'src/common/types';

export interface IEzManageOrder {
  orderNumber: string;
  uuid: UUID;
  event: IEzManageOrderEvent;
  orderCustomer: IEzManageOrderCustomer;
  totals: IEzManageOrderTotals;
  caterer: ICaterer /** @TODO add to validator */;
  catererCart: ICatererCart;
  orderSourceType: string;
}

interface IEzManageOrderEvent {
  timestamp: string;
  timeZoneOffset: string;
  address: IEzManageOrderEventAddress | null;
  contact: IEzManageOrderEventContact | null;
}

export interface IEzManageOrderEventAddress {
  city: string | null;
  name: string | null;
  state: string | null;
  street: string | null;
  street2: string | null;
  street3: string | null;
  zip: string | null;
}

export interface IEzManageOrderEventContact {
  name: string | null;
  phone: string | null;
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

interface ICaterer {
  address: {
    city: string;
  };
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

export interface IEzManageOrderItem {
  quantity: number;
  name: string;
  totalInSubunits: ISubunits;
  customizations: IEzManageOrderItemCustomization[];
}

export interface IEzManageOrderItemCustomization {
  customizationTypeName: string;
  name: string;
  quantity: number;
}

interface IEzManageOrderCatererTotals {
  catererTotalDue: number;
}
