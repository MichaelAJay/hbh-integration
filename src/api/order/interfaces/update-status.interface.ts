import { UUID } from 'src/common/types';
import { OrderStatus } from 'src/external-modules/database/enum';

export interface IUpdateStatus {
  id: UUID;
  status: OrderStatus;
}
