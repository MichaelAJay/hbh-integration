import { Controller, Post } from '@nestjs/common';
import { EzmanageSubscriberService } from './ezmanage-subscriber.service';

@Controller('ezmanage-subscriber')
export class EzmanageSubscriberController {
  constructor(
    private readonly ezManageSubscriberService: EzmanageSubscriberService,
  ) {}

  @Post()
  async receiveOrder() {
    return this.ezManageSubscriberService.receiveOrder();
  }
}
