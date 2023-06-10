import { UUID } from 'src/common/types';
import { DbOrderStatus } from 'src/external-modules/database/enum';

export interface IUpdateStatus {
  id: UUID;
  status: DbOrderStatus;
}
