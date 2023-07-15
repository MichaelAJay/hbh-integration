import { IsString } from 'class-validator';
import { IEventNotificationPayload } from '../../interfaces';

export class EzManageWebhookPayloadBodyDto
  implements IEventNotificationPayload
{
  @IsString()
  parent_type: string;

  @IsString()
  parent_id: string;

  @IsString()
  entity_type: string;

  @IsString()
  entity_id: string;

  @IsString()
  key: string;

  @IsString()
  occurred_at: string;
}
