import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Public } from 'src/decorators';
import { RefreshAuthenticationReq } from 'src/decorators/refresh-authentication-request.decorator';
import { RefreshTokenGuard } from 'src/guards';
import { IRefreshAuthenticationRequest } from '../interfaces';
import { LoginBodyDto } from './dtos/body/login.dto';
import { ILogin } from './interfaces/login.interface';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @Post('login')
  async login(@Body() body: LoginBodyDto) {
    return this.userService.login(body as ILogin);
  }

  @Public()
  @UseGuards(RefreshTokenGuard)
  @Post('refresh-auth')
  async refreshAuth(
    @RefreshAuthenticationReq() req: IRefreshAuthenticationRequest,
  ) {
    const { userId, rt } = req;
    return this.userService.refreshAuth({ userId, rt });
  }
}
