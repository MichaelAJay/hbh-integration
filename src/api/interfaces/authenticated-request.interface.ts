import { Request } from 'express';

/**
 * May be used for any routes which pass through the standard AuthGuard
 */
export interface IAuthenticatedRequest extends Request {
  accountId: string;
  userId: string;
  ref: string;
}
