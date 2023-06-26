import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CrmError } from 'src/common/classes';
import { IEzManageOrder } from 'src/external-modules/ezmanage-api/interfaces/gql/responses';
import { AccountRecordWithId } from '../database/account-db-handler/types';
import { NutshellApiHandlerService } from './nutshell-api-handler.service';
import * as Sentry from '@sentry/node';
import { IAccountModelWithId } from 'src/external-modules/database/models';

@Injectable()
export class CrmHandlerService {
  constructor(private readonly nutshellApiHandler: NutshellApiHandlerService) {}

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

  async updateCRMEntity({
    account,
    order,
    crmEntityId,
  }: {
    account: IAccountModelWithId;
    order: IEzManageOrder;
    crmEntityId: string;
  }) {
    switch (account.crm) {
      case 'NUTSHELL':
        return await this.nutshellApiHandler.updatePrimaryEntity({
          account,
          order,
          primaryEntityId: crmEntityId,
        });
      default:
        const err = new CrmError('CRM not found for updateCRMEntity');
        Sentry.captureException(err);
        err.isLogged = true;
        throw err;
    }
  }

  updateNutshell;

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
