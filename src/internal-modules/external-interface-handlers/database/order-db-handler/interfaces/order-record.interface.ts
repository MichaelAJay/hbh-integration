import { DocumentReference, Timestamp } from '@google-cloud/firestore';
import { Overwrite, UUID } from 'src/common/types';
import { isInputDocumentReference } from '../../utility/methods';

export interface IOrderRecord {
  accountId: DocumentReference;
  catererId: DocumentReference;
  name: string;
  acceptedAt: Timestamp;
  lastUpdatedAt: Timestamp;
}

export interface IOrderRecordWithId extends IOrderRecord {
  id: UUID;
}

export type OrderRecordInput = Overwrite<
  IOrderRecord,
  {
    acceptedAt: Date;
    lastUpdatedAt: Date;
  }
>;

export function isIOrderRecord(record: any): record is IOrderRecordWithId {
  const { id, accountId, catererId, name } = record;
  return (
    typeof id === 'string' &&
    isInputDocumentReference(accountId) &&
    isInputDocumentReference(catererId) &&
    typeof name === 'string'
  );
}
