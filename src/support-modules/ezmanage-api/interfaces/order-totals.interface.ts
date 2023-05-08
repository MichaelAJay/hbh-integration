import { IEzManageMoney } from '.';

export interface IEzManageOrderTotals {
  customerTotalDue: IEzManageMoney;
  pointOfSaleIntegrationFee: IEzManageMoney;
  salesTax: IEzManageMoney;
  salesTaxRemittance: IEzManageMoney;
  subtotal: IEzManageMoney;
  tip?: IEzManageMoney;
}
