import { IsString } from 'class-validator';

export class SentOrderToCrmQueryDto {
  @IsString()
  'order-id': string;

  @IsString()
  accountId: string;

  @IsString()
  ref: string;
}
