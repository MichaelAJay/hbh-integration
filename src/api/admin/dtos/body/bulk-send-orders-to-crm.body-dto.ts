import { IsString } from 'class-validator';

export class BulkSendOrdersToCrm {
  @IsString({ each: true })
  orderNames: string[];
  @IsString()
  accountId: string;
  @IsString()
  ref: string;
}
