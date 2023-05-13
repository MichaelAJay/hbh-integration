import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CustomLoggerModule } from 'src/support-modules/custom-logger/custom-logger.module';
import { AuthService } from './auth.service';

@Module({
  imports: [CustomLoggerModule],
  providers: [AuthService, JwtService],
  exports: [AuthService],
})
export class AuthModule {}
