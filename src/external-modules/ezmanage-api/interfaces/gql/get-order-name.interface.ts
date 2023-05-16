export interface IGetOrderName {
  order: {
    orderName: string;
  };
}

export function isGetOrderNameReturn(data: any): data is IGetOrderName {
  return (
    typeof data.order === 'object' &&
    'orderName' in data.order &&
    typeof data.order.orderName === 'string'
  );
}
