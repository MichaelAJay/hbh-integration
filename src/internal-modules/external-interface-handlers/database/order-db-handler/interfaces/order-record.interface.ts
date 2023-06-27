import { DocumentReference, Timestamp } from '@google-cloud/firestore';
import { Overwrite, UUID } from 'src/common/types';
import { DbOrderStatus } from 'src/external-modules/database/enum';
import { isInputDocumentReference } from '../../utility/methods';

export interface IOrderRecord {
  accountId: DocumentReference;
  catererId: DocumentReference;
  catererName: string;
  name: string;
  status: DbOrderStatus;
  warnings?: string[];
  crmId: string | null;
  crmDescription: string | null;
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
  const { id, accountId, catererId, catererName, name, status } = record;
  return (
    typeof id === 'string' &&
    isInputDocumentReference(accountId) &&
    isInputDocumentReference(catererId) &&
    typeof catererName === 'string' &&
    typeof name === 'string' &&
    Object.values(DbOrderStatus).includes(status)
  );
}
