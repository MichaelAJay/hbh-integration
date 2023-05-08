import { IEzManageOrderItem } from '.';

interface ITableware {
  specialInstructions?: string;
  tablewareChoices: any[];
}

export interface IEzManageCatererTotals {
  catererTotalDue: number;
}

export interface IEzManageCatererCart {
  feesAndDiscounts: any[];
  orderItems: IEzManageOrderItem[];
  tableware: ITableware | null;
  totals: IEzManageCatererTotals | null;
}
