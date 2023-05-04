import { Module } from '@nestjs/common';
import { EzmanageSubscriberController } from './ezmanage-subscriber.controller';
import { EzmanageSubscriberService } from './ezmanage-subscriber.service';

@Module({
  controllers: [EzmanageSubscriberController],
  providers: [EzmanageSubscriberService]
})
export class EzmanageSubscriberModule {}
