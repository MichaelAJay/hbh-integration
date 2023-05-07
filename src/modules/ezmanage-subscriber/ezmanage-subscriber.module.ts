import { Module } from '@nestjs/common';
import { CustomLoggerModule } from 'src/support-modules/custom-logger/custom-logger.module';
import { DatabaseModule } from 'src/support-modules/database/database.module';
import { EzmanageApiModule } from 'src/support-modules/ezmanage-api/ezmanage-api.module';
import { EzmanageSubscriberController } from './ezmanage-subscriber.controller';
import { EzmanageSubscriberService } from './ezmanage-subscriber.service';

@Module({
  imports: [EzmanageApiModule, CustomLoggerModule, DatabaseModule],
  controllers: [EzmanageSubscriberController],
  providers: [EzmanageSubscriberService],
})
export class EzmanageSubscriberModule {}
