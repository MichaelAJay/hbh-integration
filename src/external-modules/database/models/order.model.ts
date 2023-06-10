import { UUID } from '../../../common/types';
import { DbOrderStatus } from '../enum';

export interface IOrderModel {
  accountId: string;
  catererId: UUID;
  catererName: string;
  name: string;
  status: DbOrderStatus;
  crmId: string | null;
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
    typeof obj.caterername === 'string' &&
    typeof obj.name === 'string' &&
    Object.values(DbOrderStatus).includes(obj.status)
  );
}
