import { Module } from '@nestjs/common';
import { NutshellApiModule } from 'src/external-modules/nutshell-api/nutshell-api.module';
import { NutshellApiHandlerService } from './nutshell-api-handler.service';

@Module({
  imports: [NutshellApiModule],
  providers: [NutshellApiHandlerService],
  exports: [NutshellApiHandlerService],
})
export class NutshellApiHandlerModule {}
