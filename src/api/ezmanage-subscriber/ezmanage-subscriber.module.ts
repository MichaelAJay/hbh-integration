import { Module } from '@nestjs/common';
import { CustomLoggerModule } from 'src/support-modules/custom-logger/custom-logger.module';
import { EzmanageSubscriberController } from './ezmanage-subscriber.controller';
import { EzmanageSubscriberAPIService } from './ezmanage-subscriber.service';
import { EzmanageSubscriberInternalInterfaceService } from './ezmanage-subscriber-internal-interface.service';
import { InternalDatabaseModule } from 'src/internal-modules/external-interface-handlers/database/database.module';
import { OrderModule } from 'src/internal-modules/order/order.module';
import { AccountModule } from 'src/internal-modules/account/account.module';

@Module({
  imports: [
    CustomLoggerModule,
    InternalDatabaseModule,
    AccountModule,
    OrderModule,
  ],
  controllers: [EzmanageSubscriberController],
  providers: [
    EzmanageSubscriberAPIService,
    EzmanageSubscriberInternalInterfaceService,
  ],
  exports: [
    EzmanageSubscriberAPIService,
    EzmanageSubscriberInternalInterfaceService,
  ],
})
export class EzmanageSubscriberAPIModule {}
