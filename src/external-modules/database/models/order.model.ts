import { UUID } from '../../../common/types';

export interface IOrderModel {
  accountId: string;
  catererId: UUID;
  name: string;
  acceptedAt: Date; // Firestore calls this the "timestamp" field type
  lastUpdatedAt: Date;
}

export interface IOrderModelWithId extends IOrderModel {
  id: UUID;
}

export type UpdateOrder = Partial<
  Omit<IOrderModel, 'accountId' | 'catererId' | 'acceptedAt'>
>;

export function isIOrderModelWithId(obj: any): obj is IOrderModelWithId {
  return (
    typeof obj.id === 'string' &&
    typeof obj.accountId === 'string' &&
    typeof obj.catererId === 'string' &&
    typeof obj.name === 'string'
  );
}
