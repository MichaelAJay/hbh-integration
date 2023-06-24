export interface IProductEntity {
  id: string;
  quantity: number;
  price?: {
    currency_shortname: string; // 'USD'
    amount: string; // e.g. '49.99'
  };
}
