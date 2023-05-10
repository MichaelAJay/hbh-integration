import { BadRequestException, Injectable } from '@nestjs/common';
import { CustomLoggerService } from 'src/support-modules/custom-logger/custom-logger.service';

import { EventNotificationPayloadKey } from './enums';
import { IEventNotificationPayload } from './interfaces';
import { EzmanageSubscriberInternalInterfaceService } from './ezmanage-subscriber-internal-interface.service';
import { EzManagePayloadValidator } from './utility/methods/validators';

@Injectable()
export class EzmanageSubscriberService {
  constructor(
    private readonly ezManageInternalInterface: EzmanageSubscriberInternalInterfaceService,
    private readonly customLogger: CustomLoggerService,
  ) {}

  async handleWebhook(payload: IEventNotificationPayload) {
    /**
     * Custom validator with logging
     */
    try {
      EzManagePayloadValidator(payload);
    } catch (err) {
      /** @TODO LOG ERR */
      throw new BadRequestException(
        'Payload did not meet validation requirements',
      );
    }

    try {
      const { parent_id, entity_id, key, occurred_at } = payload;

      await this.ezManageInternalInterface.handleWebhook({
        parent_id,
        entity_id,
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