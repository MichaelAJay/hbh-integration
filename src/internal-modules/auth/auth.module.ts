import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';

@Module({
  providers: [AuthService, JwtService],
  exports: [AuthService],
})
export class AuthModule {}
