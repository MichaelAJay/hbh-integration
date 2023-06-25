import { Body, Controller, Post, UseGuards } from '@nestjs/common';
// import { Public } from 'src/decorators';
import { Public } from '../../decorators';
import { EzManageWebhookGuard } from 'src/guards';
import { EzmanageSubscriberAPIService } from './ezmanage-subscriber.service';
import { IEventNotificationPayload } from './interfaces';

@UseGuards(EzManageWebhookGuard)
@Controller('ezmanage-subscriber')
export class EzmanageSubscriberController {
  constructor(
    private readonly ezManageSubscriberService: EzmanageSubscriberAPIService,
  ) {}

  @Public()
  @Post('hams-for-Him')
  async handleWebhook(@Body() payload: IEventNotificationPayload) {
    return this.ezManageSubscriberService.handleWebhook(payload);
  }
}
