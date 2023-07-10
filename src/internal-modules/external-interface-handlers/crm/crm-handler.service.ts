import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CrmError } from 'src/common/classes';
import { IEzManageOrder } from 'src/external-modules/ezmanage-api/interfaces/gql/responses';
import { AccountRecordWithId } from '../database/account-db-handler/types';
import { NutshellApiHandlerService } from './nutshell-api-handler.service';
import * as Sentry from '@sentry/node';
import {
  IAccountModelWithId,
  OrderModelCRMProperties,
} from 'src/external-modules/database/models';

@Injectable()
export class CrmHandlerService {
  constructor(public readonly nutshellApiHandler: NutshellApiHandlerService) {}

  /**
   * Need to think about a supertype
   */
  async generateCRMEntity({
    account,
    order,
  }: {
    account: AccountRecordWithId;
    order: any;
    /**
     * @TODO fix return type
     */
  }): Promise<any> {
    switch (account.crm) {
      case 'NUTSHELL':
        return await this.nutshellApiHandler.generatePrimaryEntity({
          account,
          order,
        });
      default:
        const err = new CrmError('CRM not found for generateCRMEntity');
        Sentry.captureException(err);
        err.isLogged = true;
        throw err;
    }
  }

  async updateCRMEntityWithOrder({
    account,
    order,
    crmEntityId,
    additionalAndExistingTags,
  }: {
    account: IAccountModelWithId;
    order: IEzManageOrder;
    crmEntityId: string;
    additionalAndExistingTags?: string[];
  }): Promise<Partial<OrderModelCRMProperties>> {
    switch (account.crm) {
      case 'NUTSHELL':
        const { description: crmDescription } =
          await this.nutshellApiHandler.updatePrimaryEntityWithOrder({
            account,
            order,
            primaryEntityId: crmEntityId,
            additionalAndExistingTags,
          });
        return { crmDescription };
      default:
        const err = new CrmError(`${account.crm} is not supported.`);
        Sentry.withScope((scope) => {
          scope.setExtras({ account, orderNumber: order.orderNumber });
          Sentry.captureException(err);
        });
        err.isLogged = true;
        throw err;
    }
  }

  async getProducts({ account }: { account: AccountRecordWithId }) {
    switch (account.crm) {
      case 'NUTSHELL':
        return await this.nutshellApiHandler.getProducts({ ref: account.ref });
      default:
        /** LOG */
        throw new InternalServerErrorException(
          `Get products method not defined for CRM ${account.crm}`,
        );
    }
  }
}
