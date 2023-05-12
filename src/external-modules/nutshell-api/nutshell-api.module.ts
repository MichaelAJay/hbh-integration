import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { NutshellApiService } from './nutshell-api.service';
import { CustomLoggerModule } from 'src/support-modules/custom-logger/custom-logger.module';

@Module({
  imports: [CacheModule.register({}), CustomLoggerModule],
  providers: [NutshellApiService],
})
export class NutshellApiModule {}
