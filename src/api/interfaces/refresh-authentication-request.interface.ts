import { Request } from 'express';

export interface IRefreshAuthenticationRequest extends Request {
  userId: string;
  rt: string;
}
