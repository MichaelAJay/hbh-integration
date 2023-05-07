import { Body, Controller, Post } from '@nestjs/common';
import { EzmanageSubscriberService } from './ezmanage-subscriber.service';
import { IEventNotificationPayload } from './interfaces';

@Controller('ezmanage-subscriber')
export class EzmanageSubscriberController {
  constructor(
    private readonly ezManageSubscriberService: EzmanageSubscriberService,
  ) {}

  @Post()
  async handleWebhook(@Body() payload: IEventNotificationPayload) {
    return this.ezManageSubscriberService.handleWebhook(payload);
  }
}
