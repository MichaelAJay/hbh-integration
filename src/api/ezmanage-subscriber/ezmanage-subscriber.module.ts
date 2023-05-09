import { Module } from '@nestjs/common';
import { CustomLoggerModule } from 'src/support-modules/custom-logger/custom-logger.module';
import { EzmanageSubscriberController } from './ezmanage-subscriber.controller';
import { EzmanageSubscriberService } from './ezmanage-subscriber.service';
import { EzmanageSubscriberInternalInterfaceService } from './ezmanage-subscriber-internal-interface.service';
import { InternalDatabaseModule } from 'src/internal-modules/external-interface-handlers/database/database.module';
import { InternalEzmanageApiModule } from 'src/internal-modules/external-interface-handlers/ezmanage-api/ezmanage-api.module';

@Module({
  imports: [
    CustomLoggerModule,
    InternalDatabaseModule,
    InternalEzmanageApiModule,
  ],
  controllers: [EzmanageSubscriberController],
  providers: [
    EzmanageSubscriberService,
    EzmanageSubscriberInternalInterfaceService,
  ],
})
export class EzmanageSubscriberModule {}
