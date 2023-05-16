import { IsEmail, IsEnum, IsString } from 'class-validator';
import { AccountRef } from 'src/external-modules/database/enum';

export class AdminCreateUserBodyDto {
  @IsEmail()
  email: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEnum(AccountRef)
  ref: AccountRef;
}
