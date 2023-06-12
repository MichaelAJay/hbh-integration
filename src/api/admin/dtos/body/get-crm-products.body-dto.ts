import { IsString } from 'class-validator';

export class GetCrmProductsBodyDto {
  @IsString()
  'account-id': string;
}
