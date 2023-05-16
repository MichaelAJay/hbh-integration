export interface IGetOrderName {
  order: {
    orderNumber: string;
  };
}

export function isGetOrderNameReturn(data: any): data is IGetOrderName {
  return (
    typeof data.order === 'object' &&
    'orderNumber' in data.order &&
    typeof data.order.orderNumber === 'string'
  );
}
