import { Injectable } from '@nestjs/common';
import { InternalError, OrderManagerError } from 'src/common/classes';
import { IEzManageOrder } from 'src/external-modules/ezmanage-api/interfaces/gql/responses';
import { NutshellApiService } from 'src/external-modules/nutshell-api/nutshell-api.service';
import {
  AccountRecordWithId,
  ACCOUNT_REF,
} from '../database/account-db-handler/types';
import {
  compareEzManageSubtotalToCrmSubtotal,
  outputH4HOrderToCrm,
} from './accounts/H4H/utility';
import * as Sentry from '@sentry/node';
import { IAccountModelWithId } from 'src/external-modules/database/models';
import { validateEzManageOrder } from 'src/external-modules/ezmanage-api/validators';
import { GeneratePrimaryNutshellEntityReturn } from './types/returns';

@Injectable()
export class NutshellApiHandlerService {
  constructor(private readonly nutshellApiService: NutshellApiService) {}

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
        return await this.createLead({
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

  async updatePrimaryEntityWithOrder({
    account,
    order,
    primaryEntityId,
  }: {
    account: AccountRecordWithId;
    order: any;
    primaryEntityId: string;
  }) {
    switch (account.crmPrimaryType) {
      case 'LEAD':
        if (!validateEzManageOrder(order)) {
          const err = new OrderManagerError('Invalid order');
          Sentry.captureException(err);
          err.isLogged = true;
          throw err;
        }
        return await this.updateLeadWithOrder({
          account,
          order: order as IEzManageOrder,
          leadId: primaryEntityId,
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

  async addTagToPrimaryEntity({
    account,
    crmEntityId,
    tag,
  }: {
    account: IAccountModelWithId;
    crmEntityId: string;
    tag: string;
  }) {}

  private async createLead({
    account,
    order,
  }: {
    account: IAccountModelWithId;
    order: IEzManageOrder;
  }): Promise<GeneratePrimaryNutshellEntityReturn> {
    const { ref } = account;
    switch (ref) {
      case 'H4H':
        const { lead, invalidKeys } = outputH4HOrderToCrm({
          order,
          account,
        });

        if (invalidKeys.length > 0) {
          Sentry.captureMessage(
            `Invalid keys from outputH4HOrderToCrm: ${invalidKeys.join(', ')}`,
            'warning',
          );
        }

        const requiredTags = account.newLeadTags
          ? account.newLeadTags
              .filter((tag) => tag.isRequired)
              .map((tag) => tag.value)
          : [];
        if (requiredTags.length > 0) {
          lead.tags = requiredTags;
        }

        const { id, description, products } =
          await this.nutshellApiService.createLead({
            ref,
            lead: { lead },
            orderName: order.orderNumber,
          });

        const isSubtotalMatch = compareEzManageSubtotalToCrmSubtotal({
          order,
          products,
        });

        return { id, description, isSubtotalMatch };
      case 'ADMIN':
      default:
        const err = new InternalError(`Invalid ref ${ref}`);
        Sentry.captureException(err);
        err.isLogged = true;
        throw err;
    }
  }

  private async updateLeadWithOrder({
    account,
    order,
    leadId,
  }: {
    account: IAccountModelWithId;
    order: IEzManageOrder;
    leadId: string;
  }) {
    const { ref } = account;
    switch (ref) {
      case 'H4H':
        const { lead, invalidKeys } = outputH4HOrderToCrm({
          order,
          account,
        });

        if (invalidKeys.length > 0) {
          Sentry.captureMessage(
            `Invalid keys from outputH4HOrderToCrm: ${invalidKeys.join(', ')}`,
            'warning',
          );
        }

        const requiredTags = Array.isArray(account.newLeadTags)
          ? account.newLeadTags
              .filter((tag) => tag.isRequired)
              .map((tag) => tag.value)
          : [];
        if (requiredTags) {
          lead.tags = requiredTags;
        }

        return await this.nutshellApiService.updateLeadWithOrder({
          leadId: parseInt(leadId, 10),
          ref,
          lead: { lead },
        });

      case 'ADMIN':
      default:
        const err = new InternalError(`Invalid ref ${ref}`);
        Sentry.captureException(err);
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
