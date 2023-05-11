import { UUID } from '../../../common/types';
import { OrderStatus } from '../enum';

export interface IOrderModel {
  accountId: string;
  catererId: UUID;
  name: string;
  status: OrderStatus;
  acceptedAt: Date; // Firestore calls this the "timestamp" field type
  lastUpdatedAt: Date;
}

export interface IOrderModelWithId extends IOrderModel {
  id: UUID;
}

export function isIOrderModelWithId(obj: any): obj is IOrderModelWithId {
  return (
    typeof obj.id === 'string' &&
    typeof obj.accountId === 'string' &&
    typeof obj.catererId === 'string' &&
    typeof obj.name === 'string' &&
    Object.values(OrderStatus).includes(obj.status)
  );
}
