export interface IAccountModel {
  accEnvVarPrefix: string;
  name: string;
  contactEmail: string;
  isActive: boolean;
}

export interface IAccountModelWithId extends IAccountModel {
  id: string;
}

export function isIAccountModelWithId(obj: any): obj is IAccountModelWithId {
  return (
    typeof obj.id === 'string' &&
    typeof obj.accEnvVarPrefix === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.contactEmail === 'string' &&
    typeof obj.isActive === 'boolean'
  );
}
