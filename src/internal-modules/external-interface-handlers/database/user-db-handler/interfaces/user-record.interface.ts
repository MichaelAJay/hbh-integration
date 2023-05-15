import { DocumentReference } from '@google-cloud/firestore';
import { isInputDocumentReference } from '../../utility/methods';

export interface IUserRecord {
  accountId: DocumentReference;
  firstName: string;
  lastName: string;
  email: string;
  hashedPassword: string;
  salt: string;
  hashedRt?: string;
}

export interface IUserRecordWithId extends IUserRecord {
  id: string;
}

export type UserRecordInput = Omit<IUserRecord, 'hashedRt'>;

export function isIUserRecord(record: any): record is IUserRecordWithId {
  const {
    id,
    accountId,
    firstName,
    lastName,
    email,
    hashedPassword,
    salt,
    hashedRt,
  } = record;
  return (
    typeof id === 'string' &&
    isInputDocumentReference(accountId) &&
    typeof firstName === 'string' &&
    typeof lastName === 'string' &&
    typeof email === 'string' &&
    typeof hashedPassword === 'string' &&
    typeof salt === 'string' &&
    (!hashedRt || typeof hashedRt === 'string')
  );
}
