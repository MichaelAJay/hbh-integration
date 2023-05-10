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
     * @TODO DELETE
     * Getting an idea of how the data is sent
     */
    console.log('PAYLOAD', payload);
    this.logger.log('webhook request received', payload);

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
