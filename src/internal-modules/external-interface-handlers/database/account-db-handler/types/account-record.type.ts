import { IAccountModel } from 'src/external-modules/database/models';

export type AccountRecord = IAccountModel;

export type AccountRecordWithId = AccountRecord & { id: string };

export function isAccountRecordWithId(
  record: any,
): record is AccountRecordWithId {
  const { id, ref, name, contactEmail, isActive } = record;
  return (
    typeof id === 'string' &&
    typeof ref === 'string' &&
    typeof name === 'string' &&
    typeof contactEmail === 'string' &&
    typeof isActive === 'boolean'
  );
}
