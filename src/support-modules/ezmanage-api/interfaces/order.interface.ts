import { UUID } from 'src/common/types';
import {
  IEzManageAddress,
  IEzManageCaterer,
  IEzManageCatererCart,
  IEzManageOrderCustomer,
  IEzManageOrderEvent,
  IEzManageOrderTotals,
} from '.';
import { OrderSource } from '../enums';

export interface IEzManageOrder {
  caterer: IEzManageCaterer;
  catererCart: IEzManageCatererCart;
  event: IEzManageOrderEvent;
  isTaxEmpty: boolean;
  orderCustomer: IEzManageOrderCustomer;
  orderNumber?: string;
  orderSourceType: OrderSource;
  taxableAddress: IEzManageAddress;
  totals: IEzManageOrderTotals;
  uuid: UUID;
}
