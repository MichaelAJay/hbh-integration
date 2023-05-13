export interface IUserModel {
  accountId: string;
  firstName: string;
  lastName: string;
  email: string;
  hashedPassword: string;
  salt: string;
  hashedRt?: string;
}

export interface IUserModelWithId extends IUserModel {
  id: string;
}

export function isIUserModelWithId(obj: any): obj is IUserModelWithId {
  return (
    typeof obj.id === 'string' &&
    typeof obj.accountId === 'string' &&
    typeof obj.firstName === 'string' &&
    typeof obj.lastName === 'string' &&
    typeof obj.email === 'string' &&
    typeof obj.hashedPassword === 'string' &&
    typeof obj.salt === 'string'
  );
}
