import { Module } from '@nestjs/common';
import { CustomLoggerModule } from 'src/support-modules/custom-logger/custom-logger.module';
import { CrmModule } from '../external-interface-handlers/crm/crm.module';
import { InternalDatabaseModule } from '../external-interface-handlers/database/database.module';
import { EzmanageApiHandlerModule } from '../external-interface-handlers/ezmanage-api/ezmanage-api-handler.module';
import { OrderService } from './order.service';

@Module({
  imports: [
    InternalDatabaseModule,
    CrmModule,
    EzmanageApiHandlerModule,
    CustomLoggerModule,
  ],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
