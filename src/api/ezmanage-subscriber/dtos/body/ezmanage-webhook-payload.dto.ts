import { IsIn, IsString } from 'class-validator';
import {
  EventNotificationPayloadEntityType,
  EventNotificationPayloadKey,
  EventNotificationPayloadParentType,
} from '../../enums';
import { IEventNotificationPayload } from '../../interfaces';

export class EzManageWebhookPayloadBodyDto
  implements IEventNotificationPayload
{
  // @IsString()
  @IsIn([EventNotificationPayloadParentType.CATERER])
  parent_type: EventNotificationPayloadParentType.CATERER;

  @IsString()
  parent_id: string;

  @IsIn([EventNotificationPayloadEntityType.ORDER])
  entity_type: EventNotificationPayloadEntityType.ORDER;

  @IsString()
  entity_id: string;

  @IsIn([
    EventNotificationPayloadKey.ACCEPTED,
    EventNotificationPayloadKey.CANCELLED,
    EventNotificationPayloadKey.UPDATED,
  ])
  key: EventNotificationPayloadKey;

  @IsString()
  occurred_at: string;
}
