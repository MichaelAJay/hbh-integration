import { Body, Controller, Post } from '@nestjs/common';
import { Public } from 'src/decorators';
import { LoginBodyDto } from './dtos/body/login.dto';
import { ILogin } from './interfaces/login.interface';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @Post('login')
  async login(@Body() body: LoginBodyDto) {
    return this.login(body as ILogin);
  }
}
