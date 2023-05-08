enum Currency {
  USD = 'USD',
}

export interface IEzManageMoney {
  currency: Currency;
  subunits: number;
  subunitsV2: bigint;
}
