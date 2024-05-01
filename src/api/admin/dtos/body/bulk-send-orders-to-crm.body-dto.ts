import { IsString } from 'class-validator';

export class BulkSendOrdersToCrm {
  @IsString()
  orderNames: string;
  @IsString()
  accountId: string;
  @IsString()
  ref: string;
}

export class BulkGenerateInvoices {
  @IsString()
  orderNames: string;
  @IsString()
  accountId: string;
  @IsString()
  ref: string;
}
