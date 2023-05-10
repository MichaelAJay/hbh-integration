import { DocumentReference } from '@google-cloud/firestore';
import { UUID } from 'src/common/types';

export interface ICatererRecord {
  id: UUID;
  accountId: DocumentReference;
  city: string;
  storeNumber: string;
}

/**
 * @IMPLEMENTATION_NOTE
 * isICatererRecord subsumes isICatererModelWithId
 */
export function isICatererRecord(record: any): record is ICatererRecord {
  const { id, accountId, city, storeNumber } = record;
  return (
    typeof id === 'string' &&
    typeof city === 'string' &&
    typeof storeNumber === 'string' &&
    accountId &&
    typeof accountId === 'object' &&
    'id' in accountId &&
    typeof accountId.id === 'string'
  );
}

/**
 * @TODO try out the isInputDocumentReference
 */
