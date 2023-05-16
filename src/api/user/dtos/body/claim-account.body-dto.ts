import { IsString } from 'class-validator';
import { IResetPassword } from '../../interfaces';

export class ClaimAccountBodyDto implements IResetPassword {
  @IsString()
  token: string;

  @IsString()
  newPassword: string;
}
