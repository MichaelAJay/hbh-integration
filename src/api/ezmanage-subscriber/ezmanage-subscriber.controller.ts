import {
  Body,
  Controller,
  InternalServerErrorException,
  Post,
} from '@nestjs/common';
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
    const { H4H_ACCOUNT_NAME: ACCOUNT_NAME } = process.env;
    if (!ACCOUNT_NAME)
      throw new InternalServerErrorException('Bad configuration');

    const accountName = ACCOUNT_NAME.split('_').join(' ');
    return this.ezManageSubscriberService.handleWebhook(accountName, payload);
  }
}
