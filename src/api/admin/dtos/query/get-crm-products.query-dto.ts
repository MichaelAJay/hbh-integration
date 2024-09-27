import { IsString } from 'class-validator';

export class GetCrmProductsQueryDto {
  @IsString()
  'account-id': string;
}
