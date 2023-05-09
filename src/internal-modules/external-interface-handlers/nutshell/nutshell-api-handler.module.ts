import { Module } from '@nestjs/common';
import { NutshellApiHandlerService } from './nutshell-api-handler.service';

@Module({
  providers: [NutshellApiHandlerService],
})
export class NutshellApiHandlerModule {}
