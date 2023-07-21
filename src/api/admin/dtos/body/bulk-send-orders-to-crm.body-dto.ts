import { IsString } from 'class-validator';

export class BulkSendOrdersToCrm {
  @IsString()
  orderNames: string;
  @IsString()
  accountId: string;
  @IsString()
  ref: string;
}
