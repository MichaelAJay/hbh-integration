import { IProductEntity } from '../entities';

export interface IUpsertLead<CustomFields> {
  lead: IUpsertLeadEntity<CustomFields>;
}

export interface IUpsertLeadEntity<CustomFields> {
  products: IProductEntity[];
  stagesetId?: string; // Pipeline
  description?: string /** Will use this field for name */;
  assignee?: {
    entityType: 'Users';
    id: number;
  };
  dueTime?: string; // ISO 8601 e.g. "2010-11-13T15:23:19-05:00"
  tags?: string[];
  customFields?: CustomFields;
}

/**
 * Implementation notes:
 * I conceive of "dueTime" as when the order should be delivered.
 *
 */