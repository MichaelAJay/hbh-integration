import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { IEzManageOrder } from 'src/external-modules/ezmanage-api/interfaces/gql/responses';
import { validateEzManageOrder } from 'src/external-modules/ezmanage-api/validators';
import { AccountRecordWithId } from '../database/account-db-handler/types';
import { NutshellApiHandlerService } from './nutshell-api-handler.service';

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
  }) {
    switch (account.crm) {
      case 'NUTSHELL':
        return await this.generateNutshellPrimaryEntity({
          account,
          order,
        });
      default:
        /** LOG */
        throw new InternalServerErrorException('Account CRM unspecified');
    }
  }

  async generateNutshellPrimaryEntity({
    account,
    order,
  }: {
    account: AccountRecordWithId;
    order: any;
  }) {
    switch (account.crmPrimaryType) {
      case 'LEAD':
        if (!validateEzManageOrder(order)) {
          /** LOG */
          throw new InternalServerErrorException(
            'Order does not match expected shape at CrmHandler generateNutshellPrimaryEntity',
          );
        }
        return await this.nutshellApiHandler.createLead({
          ref: account.ref,
          order: order as IEzManageOrder,
        });
      default:
        /** LOG */
        throw new InternalServerErrorException(
          'Account CRM primary entity unspecified',
        );
    }
  }

  async getProducts({ ref }: { ref: string }) {}
}
