export interface IGetOrderOutput {
  orderNumber: string;
  deliveryTime: Date;
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
}
