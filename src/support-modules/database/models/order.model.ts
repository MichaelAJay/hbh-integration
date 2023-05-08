import { UUID } from '../../../common/types';

export interface IOrderModel {
  accountId: string;
  catererId: UUID;
  name: string;
  acceptedAt: Date; // Firestore calls this the "timestamp" field type
  lastUpdatedAt: Date;
}
