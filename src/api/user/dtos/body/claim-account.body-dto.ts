import { IsString } from 'class-validator';
import { IClaimAccount } from '../../interfaces';

export class ClaimAccountBodyDto implements IClaimAccount {
  @IsString()
  token: string;

  @IsString()
  newPassword: string;
}
