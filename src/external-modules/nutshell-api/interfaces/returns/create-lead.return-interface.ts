export interface ICreateLeadReturn {
  id: string;
  description?: string;
  products: { amountInUsd: number }[];
  tags?: string[];
}
