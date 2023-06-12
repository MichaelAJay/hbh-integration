import {
  CRM_NAME,
  CRM_PRIMARY_ENTITY,
} from 'src/internal-modules/external-interface-handlers/crm/types';
import { ACCOUNT_REF } from 'src/internal-modules/external-interface-handlers/database/account-db-handler/types';

export interface IAccountModel {
  ref: ACCOUNT_REF;
  name: string;
  contactEmail: string;
  isActive: boolean;
  crm?: CRM_NAME;
  crmPrimaryType?: CRM_PRIMARY_ENTITY;
}

export interface IAccountModelWithId extends IAccountModel {
  id: string;
}

export function isIAccountModelWithId(obj: any): obj is IAccountModelWithId {
  return (
    typeof obj.id === 'string' &&
    typeof obj.ref === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.contactEmail === 'string' &&
    typeof obj.isActive === 'boolean'
  );
}
