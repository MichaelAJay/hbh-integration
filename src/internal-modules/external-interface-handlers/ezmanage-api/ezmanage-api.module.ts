import { Module } from '@nestjs/common';
import { EzmanageApiHandlerService } from './ezmanage-api-handler.service';

@Module({
  providers: [EzmanageApiHandlerService],
  exports: [EzmanageApiHandlerService],
})
export class InternalEzmanageApiModule {}
