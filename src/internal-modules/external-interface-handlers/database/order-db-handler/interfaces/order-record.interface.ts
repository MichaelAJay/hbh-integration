import { DocumentReference } from '@google-cloud/firestore';
import { UUID } from 'src/common/types';
import { isInputDocumentReference } from '../../utility/methods';

export interface IOrderRecord {
  id: UUID;
  accountId: DocumentReference;
  catererId: DocumentReference;
  name: string;
  acceptedAt: Date;
  lastUpdatedAt: Date;
}

export function isIOrderRecord(record: any): record is IOrderRecord {
  const { id, accountId, catererId, name } = record;
  return (
    typeof id === 'string' &&
    isInputDocumentReference(accountId) &&
    isInputDocumentReference(catererId) &&
    typeof name === 'string'
  );
}
