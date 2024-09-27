import { Injectable } from '@nestjs/common';
import { EventNotificationPayloadKey } from './enums';
import { IEventNotificationPayload } from './interfaces';
import { EzmanageSubscriberInternalInterfaceService } from './ezmanage-subscriber-internal-interface.service';

@Injectable()
export class EzmanageSubscriberAPIService {
  constructor(
    private readonly ezManageInternalInterface: EzmanageSubscriberInternalInterfaceService,
  ) {}

  async handleWebhook(payload: IEventNotificationPayload) {
    try {
      const {
        parent_id: catererId,
        entity_id: orderId,
        key,
        occurred_at,
      } = payload;

      await this.ezManageInternalInterface.handleWebhook({
        catererId,
        orderId,
        key: key as EventNotificationPayloadKey,
        occurred_at,
      });
    } catch (err) {
      console.error('err', err);
      throw err;
    }
  }
}

/**
 * Order looks like:
 * id
 *
 */
