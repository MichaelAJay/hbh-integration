import { UUID } from 'src/common/types';

export interface ICatererModel {
  accountId: string;
  city: string;
  storeNumber: string;
}

export interface ICatererModelWithId extends ICatererModel {
  id: UUID;
}

export function isICatererModelWithId(obj: any): obj is ICatererModelWithId {
  return (
    typeof obj.id === 'string' &&
    typeof obj.accountId === 'string' &&
    typeof obj.city === 'string' &&
    typeof obj.storeNumber === 'string'
  );
}
