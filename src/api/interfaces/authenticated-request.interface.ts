import { Request } from 'express';
import { ACCOUNT_REF } from 'src/internal-modules/external-interface-handlers/database/account-db-handler/types';

/**
 * May be used for any routes which pass through the standard AuthGuard
 */
export interface IAuthenticatedRequest extends Request {
  accountId: string;
  userId: string;
  ref: ACCOUNT_REF;
}
