export interface ICreateLeadResponse {
  result: ICreateLeadResult;
}

export interface ICreateLeadResult {
  id: number;
  description: string;
  products: {
    price: {
      amount: number; // This number has to be parseFloat(num.toFixed(2))
    };
  }[];
}

export function validateCreateLeadResponse(
  resp: any,
): resp is ICreateLeadResponse {
  return (
    typeof resp === 'object' &&
    resp.result &&
    typeof resp.result === 'object' &&
    typeof resp.result.id === 'number' &&
    typeof resp.result.description === 'string' &&
    Array.isArray(resp.result.products) &&
    resp.result.products.every((product) => validateProduct(product))
  );
}

function validateProduct(product: any): boolean {
  return (
    product &&
    typeof product === 'object' &&
    typeof product.price === 'object' &&
    typeof product.price.amount === 'number'
  );
}
