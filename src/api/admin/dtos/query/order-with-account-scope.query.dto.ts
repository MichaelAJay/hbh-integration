import { IsString } from 'class-validator';
import { ACCOUNT_REF } from 'src/internal-modules/external-interface-handlers/database/account-db-handler/types';

export class AdminOrderIdWithAccountScopeQueryDto {
  @IsString()
  'order-id': string;

  @IsString()
  'account-id': string;

  @IsString()
  ref: string;
}

export class AdminOrderNameWithAccountScopeQueryDto {
  @IsString()
  'order-name': string;

  @IsString()
  'account-id': string;

  @IsString()
  ref: ACCOUNT_REF;
}
