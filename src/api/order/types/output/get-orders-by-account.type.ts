import { IOrderModelWithId } from 'src/external-modules/database/models';

export type GetOrdersByAccount = (Pick<
  IOrderModelWithId,
  'id' | 'name' | 'status'
> & {
  caterer: string;
})[];
