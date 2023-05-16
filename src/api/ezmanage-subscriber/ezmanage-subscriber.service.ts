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
    private readonly logger: CustomLoggerService,
  ) {}

  async handleWebhook(payload: IEventNotificationPayload) {
    /**
     * Custom validator with logging
     */
    try {
      EzManagePayloadValidator(payload);
    } catch (err) {
      const msg = 'Unexpected payload failed validation requirements';
      this.logger.error(msg, payload);
      throw new BadRequestException(msg);
    }

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
