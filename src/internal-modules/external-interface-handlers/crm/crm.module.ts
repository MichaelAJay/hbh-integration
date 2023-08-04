import { Module } from '@nestjs/common';
import { NutshellApiModule } from 'src/external-modules/nutshell-api/nutshell-api.module';
import { CrmHandlerService } from './crm-handler.service';
import { NutshellApiHandlerHelperService } from './nutshell-api-handler.helper.service';
import { NutshellApiHandlerService } from './nutshell-api-handler.service';

@Module({
  imports: [NutshellApiModule],
  providers: [
    CrmHandlerService,
    NutshellApiHandlerService,
    NutshellApiHandlerHelperService,
  ],
  exports: [CrmHandlerService, NutshellApiHandlerService],
})
export class CrmModule {}
