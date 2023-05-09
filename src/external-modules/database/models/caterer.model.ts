import { UUID } from 'src/common/types';

export interface ICatererModel {
  id: UUID;
  accountId: string;
  city: string;
  storeNumber: string;
}
