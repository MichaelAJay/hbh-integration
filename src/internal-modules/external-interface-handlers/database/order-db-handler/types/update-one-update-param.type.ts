import { IOrderModel } from 'src/external-modules/database/models';

export type UpdateableOrderModel = {
  [P in Exclude<
    keyof IOrderModel,
    'accountId' | 'catererId' | 'catererName'
  >]?: IOrderModel[P];
};
