import { IsString } from 'class-validator';
import { IEventNotificationPayload } from '../../interfaces';

export class EzManageWebhookPayloadBodyDto
  implements IEventNotificationPayload
{
  @IsString()
  id: string;

  @IsString()
  parent_type: string;
  parent_id: string;
  entity_type: string;
  entity_id: string;
  key: string;
  occurred_at: string;
}
