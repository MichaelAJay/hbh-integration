import { Module } from '@nestjs/common';
import { NutshellApiModule } from 'src/external-modules/nutshell-api/nutshell-api.module';
import { CrmHandlerService } from './crm-handler.service';
import { NutshellApiHandlerService } from './nutshell-api-handler.service';

@Module({
  imports: [NutshellApiModule],
  providers: [CrmHandlerService, NutshellApiHandlerService],
  exports: [CrmHandlerService, NutshellApiHandlerService],
})
export class CrmModule {}
