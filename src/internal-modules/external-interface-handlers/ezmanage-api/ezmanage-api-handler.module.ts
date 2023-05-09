import { Module } from '@nestjs/common';
import { ExternalEzmanageApiModule } from 'src/external-modules/ezmanage-api/ezmanage-api.module';
import { EzmanageApiHandlerService } from './ezmanage-api-handler.service';

@Module({
  imports: [ExternalEzmanageApiModule],
  providers: [EzmanageApiHandlerService],
  exports: [EzmanageApiHandlerService],
})
export class EzmanageApiHandlerModule {}
