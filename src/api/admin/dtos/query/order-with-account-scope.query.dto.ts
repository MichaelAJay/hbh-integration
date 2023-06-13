import { IsString } from 'class-validator';

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
  ref: string;
}
