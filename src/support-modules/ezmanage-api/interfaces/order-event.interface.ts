import { IEzManageAddress } from '.';
import { OrderType } from '../enums';

interface IEzManageOrderEventContact {
  name?: string;
  phone?: string;
}

export interface IEzManageOrderEvent {
  address: IEzManageAddress;
  catererHandoffFoodTime: string;
  contact: IEzManageOrderEventContact;
  headcount?: number;
  orderType: OrderType;
  thirdPartyDeliveryPartner?: string;
  timeZoneIdentifier: string;
  timeZoneOffset: string;
  timestamp: string;
}
