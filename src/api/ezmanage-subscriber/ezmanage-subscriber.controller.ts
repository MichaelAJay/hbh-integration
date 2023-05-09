import { Body, Controller, Post } from '@nestjs/common';
import { EzmanageSubscriberService } from './ezmanage-subscriber.service';
import { IEventNotificationPayload } from './interfaces';

@Controller('ezmanage-subscriber')
export class EzmanageSubscriberController {
  constructor(
    private readonly ezManageSubscriberService: EzmanageSubscriberService,
  ) {}

  /**
   * Make this specific to H4H
   */
  @Post('hams-for-Him')
  async handleWebhook(@Body() payload: IEventNotificationPayload) {
    return this.ezManageSubscriberService.handleWebhook(payload);
  }
}
