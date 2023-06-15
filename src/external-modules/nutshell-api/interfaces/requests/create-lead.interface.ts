export interface ICreateLead {
  lead: ICreateLeadEntity;
}

export interface ICreateLeadEntity {
  products: ICreateLeadProduct[];
  description?: string /** Will use this field for name */;
  dueTime?: string; // ISO 8601 e.g. "2010-11-13T15:23:19-05:00"
  tags?: string[];
}

export interface ICreateLeadProduct {
  id: string;
  quantity: number;
}

/**
 * Implementation notes:
 * I conceive of "dueTime" as when the order should be delivered.
 *
 */
