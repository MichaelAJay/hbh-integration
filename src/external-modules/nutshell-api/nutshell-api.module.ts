import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { NutshellApiService } from './nutshell-api.service';

@Module({
  imports: [CacheModule.register({})],
  providers: [NutshellApiService],
  exports: [NutshellApiService],
})
export class NutshellApiModule {}
