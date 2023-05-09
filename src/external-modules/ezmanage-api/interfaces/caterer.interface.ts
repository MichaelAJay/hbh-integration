import { IEzManageAddress } from '.';

export interface IEzManageCaterer {
  address: IEzManageAddress;
  live: boolean;
  name: string;
  storeNumber: string | null;
  uuid: string;
}
