import { IEzManageAddress } from '.';

interface IEzManageOrderEventContact {
  name?: string;
  phone?: string;
}

export interface IEzManageOrderEvent {
  address: IEzManageAddress;
  catererHandoffFoodTime: string;
  contact: IEzManageOrderEventContact;
  headcount?: number;
  orderType: any; // enum
  thirdPartyDeliveryPartner?: string;
  timeZoneIdentifier: string;
  timeZoneOffset: string;
  timestamp: string;
}
