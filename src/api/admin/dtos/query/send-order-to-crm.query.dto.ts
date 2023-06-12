import { IsString } from 'class-validator';

export class SentOrderToCrmQueryDto {
  @IsString()
  'order-id': string;

  @IsString()
  'account-id': string;

  @IsString()
  ref: string;
}
