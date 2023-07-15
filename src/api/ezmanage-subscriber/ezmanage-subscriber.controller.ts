import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Public } from '../../decorators';
import { EzManageWebhookGuard } from 'src/guards';
import { EzmanageSubscriberAPIService } from './ezmanage-subscriber.service';
import { EzManageWebhookPayloadBodyDto } from './dtos/body';

@UseGuards(EzManageWebhookGuard)
@Controller('ezmanage-subscriber')
export class EzmanageSubscriberController {
  constructor(
    public readonly ezManageSubscriberService: EzmanageSubscriberAPIService,
  ) {}

  @Public()
  @Post('hams-for-Him')
  async handleH4HWebhook(@Body() payload: EzManageWebhookPayloadBodyDto) {
    return this.ezManageSubscriberService.handleWebhook(payload);
  }
}
