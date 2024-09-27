import { ACCOUNT_REF } from 'src/internal-modules/external-interface-handlers/database/account-db-handler/types';
import { ProductMap_H4H } from '../H4H/utility';

export const ProductIdSumExclusions: Record<ACCOUNT_REF, string[]> = {
  H4H: [ProductMap_H4H['EZCater/EZOrder Commission'].id],
  ADMIN: [],
  INVALID_TEST: [],
};
