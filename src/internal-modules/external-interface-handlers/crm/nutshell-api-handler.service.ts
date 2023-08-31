import { Injectable } from '@nestjs/common';
import { CrmError, OrderManagerError } from 'src/common/classes';
import { IEzManageOrder } from 'src/external-modules/ezmanage-api/interfaces/gql/responses';
import { NutshellApiService } from 'src/external-modules/nutshell-api/nutshell-api.service';
import {
  AccountRecordWithId,
  ACCOUNT_REF,
} from '../database/account-db-handler/types';
import * as Sentry from '@sentry/node';
import { validateEzManageOrder } from 'src/external-modules/ezmanage-api/validators';
import { GeneratePrimaryNutshellEntityReturn } from './types/returns';
import { NutshellApiHandlerHelperService } from './nutshell-api-handler.helper.service';

@Injectable()
export class NutshellApiHandlerService {
  constructor(
    private readonly nutshellApiService: NutshellApiService,
    private readonly nutshellApiHandlerHelper: NutshellApiHandlerHelperService,
  ) {}

  async generatePrimaryEntity({
    account,
    order,
  }: {
    account: AccountRecordWithId;
    order: any;
  }): Promise<GeneratePrimaryNutshellEntityReturn> {
    switch (account.crmPrimaryType) {
      case 'LEAD':
        if (!validateEzManageOrder(order)) {
          const err = new OrderManagerError('Invalid order');
          Sentry.captureException(err);
          err.isLogged = true;
          throw err;
        }
        return await this.nutshellApiHandlerHelper.createLead({
          account,
          order: order as IEzManageOrder,
        });
      default:
        const err = new CrmError(
          `Invalid account crmPrimaryType ${account.crmPrimaryType}`,
        );
        Sentry.captureException(err);
        err.isLogged = true;
        throw err;
    }
  }

  async updatePrimaryEntityWithOrder({
    account,
    order,
    primaryEntityId,
    additionalAndExistingTags,
  }: {
    account: AccountRecordWithId;
    order: any;
    primaryEntityId: string;
    additionalAndExistingTags?: string[];
  }) {
    switch (account.crmPrimaryType) {
      case 'LEAD':
        if (!validateEzManageOrder(order)) {
          const err = new OrderManagerError('Invalid order');
          Sentry.withScope((scope) => {
            scope.setExtras({ account, order, entityId: primaryEntityId });
            Sentry.captureException(err);
          });
          err.isLogged = true;
          throw err;
        }
        return await this.nutshellApiHandlerHelper.updateLeadWithOrder({
          account,
          order: order as IEzManageOrder,
          leadId: primaryEntityId,
          additionalAndExistingTags,
        });
      default:
        /** LOG */
        const err = new CrmError(
          `${account.crmPrimaryType} crm type is not supported.`,
        );
        Sentry.withScope((scope) => {
          scope.setExtras({ account, order, entityId: primaryEntityId });
          Sentry.captureException(err);
        });
        err.isLogged = true;
        throw err;
    }
  }

  async getProducts({ ref }: { ref: ACCOUNT_REF }) {
    try {
      return await this.nutshellApiService.getProducts({ ref });
    } catch (err) {
      throw err;
    }
  }
}
