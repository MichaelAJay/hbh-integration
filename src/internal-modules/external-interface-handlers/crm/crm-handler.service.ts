import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CrmError, InternalError, OrderManagerError } from 'src/common/classes';
import { IEzManageOrder } from 'src/external-modules/ezmanage-api/interfaces/gql/responses';
import { validateEzManageOrder } from 'src/external-modules/ezmanage-api/validators';
import { AccountRecordWithId } from '../database/account-db-handler/types';
import { NutshellApiHandlerService } from './nutshell-api-handler.service';
import * as Sentry from '@sentry/node';

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
  }): Promise<string | undefined> {
    switch (account.crm) {
      case 'NUTSHELL':
        return await this.generateNutshellPrimaryEntity({
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

  private async generateNutshellPrimaryEntity({
    account,
    order,
  }: {
    account: AccountRecordWithId;
    order: any;
  }): Promise<string | undefined> {
    switch (account.crmPrimaryType) {
      case 'LEAD':
        if (!validateEzManageOrder(order)) {
          const err = new OrderManagerError('Invalid order');
          Sentry.captureException(err);
          err.isLogged = true;
          throw err;
        }
        return await this.nutshellApiHandler.createLead({
          account,
          order: order as IEzManageOrder,
        });
      default:
        /** LOG */
        const err = new InternalError(
          `Invalid account crmPrimaryType ${account.crmPrimaryType}`,
        );
        Sentry.captureException(err);
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
