import { IsEmail, IsString } from 'class-validator';
import { ILogin } from '../../interfaces/login.interface';

export class LoginBodyDto implements ILogin {
  @IsEmail()
  username: string;

  @IsString()
  password: string;
}
