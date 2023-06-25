import { Body, Controller, Patch, Post, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { Public } from 'src/decorators';
import { RefreshAuthenticationReq } from 'src/decorators/refresh-authentication-request.decorator';
import { RefreshTokenGuard } from 'src/guards';
import { IRefreshAuthenticationRequest } from '../interfaces';
import { ClaimAccountBodyDto } from './dtos/body';
import { LoginBodyDto } from './dtos/body/login.body-dto';
import { IResetPassword } from './interfaces';
import { ILogin } from './interfaces/login.interface';
import { UserAPIService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserAPIService) {}

  @Public()
  @Post('login')
  async login(@Body() body: LoginBodyDto, @Res() res: Response) {
    const { at, rt } = await this.userService.login(body as ILogin);

    res.cookie('accessToken', at, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    });
    res.cookie('refreshToken', rt, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    });

    return res.send({ at, rt });
  }

  @Public()
  @UseGuards(RefreshTokenGuard)
  @Post('refresh-auth')
  async refreshAuth(
    @RefreshAuthenticationReq() req: IRefreshAuthenticationRequest,
    @Res() res,
  ) {
    const { userId, rt } = req;
    const { at, rt: rtOut } = await this.userService.refreshAuth({
      userId,
      rt,
    });

    res.cookie('accessToken', at, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    });
    res.cookie('refreshToken', rtOut, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    });

    return res.send({ at, rt: rtOut });
  }

  @Public()
  @Patch('claim-account')
  async claimAccount(@Body() body: ClaimAccountBodyDto) {
    return this.userService.claimAccount(body as IResetPassword);
  }
}
