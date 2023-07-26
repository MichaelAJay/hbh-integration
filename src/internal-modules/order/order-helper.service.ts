import { Injectable } from '@nestjs/common';
import { DbOrderStatus } from 'src/external-modules/database/enum';
import {
  IAccountModelWithId,
  IOrderModel,
} from 'src/external-modules/database/models';
import { H4HWarnings } from 'src/external-modules/database/models/H4H';

@Injectable()
export class OrderHelperService {
  generateIOrderModelFromCrmEntity({
    account,
    catererId,
    ezManageOrderNumber,
    status,
    crmEntity,
    catererName,
  }: {
    account: IAccountModelWithId;
    crmEntity: any;
    catererId: string;
    catererName: string;
    ezManageOrderNumber: string;
    status: DbOrderStatus;
  }) {
    /**
     * @TODO fix the date issue
     */
    const now = new Date();
    let data: IOrderModel = {
      accountId: account.id,
      catererId,
      catererName,
      name: ezManageOrderNumber,
      status,
      acceptedAt: now,
      lastUpdatedAt: now,
    };

    if (crmEntity) {
      /**
       * What if 0 or ""?
       */
      // data.crmId = typeof crmEntity.id === 'string' ? crmEntity.id : null;
      // data.crmDescription =
      //   typeof crmEntity.description === 'string'
      //     ? crmEntity.description
      //     : null;

      // if (
      //   typeof crmEntity.isSubtotalMatch === 'boolean' &&
      //   crmEntity.isSubtotalMatch === false
      // ) {
      //   const { message } = H4HWarnings.SUBTOTAL_MISMATCH;
      //   data.warnings = [message];
      // }
      data = this.tryAppendCrmDataToOrder(data, crmEntity);
    }

    return data;
  }

  tryAppendCrmDataToOrder<
    T extends Pick<IOrderModel, 'crmId' | 'crmDescription' | 'warnings'>,
  >(order: T, crmEntity: any): T {
    const output = { ...order };

    if (typeof crmEntity === 'object' && crmEntity !== null) {
      if (typeof crmEntity.id === 'string') {
        output.crmId = crmEntity.id;
      }
      if (typeof crmEntity.description === 'string') {
        output.crmDescription = crmEntity.description;
      }

      if (
        typeof crmEntity.isSubtotalMatch === 'boolean' &&
        crmEntity.isSubtotalMatch === false
      ) {
        const { message } = H4HWarnings.SUBTOTAL_MISMATCH;
        output.warnings = [message];
      }
    }
    return output;
  }
}
