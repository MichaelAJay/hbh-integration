import { Injectable } from '@nestjs/common';
import { InternalError } from 'src/common/classes';
import { IEzManageOrder } from 'src/external-modules/ezmanage-api/interfaces/gql/responses';
import { NutshellApiService } from 'src/external-modules/nutshell-api/nutshell-api.service';
import { ACCOUNT_REF } from '../database/account-db-handler/types';
import { outputH4HOrderToCrm } from './accounts/H4H/utility';
import * as Sentry from '@sentry/node';
import { IAccountModelWithId } from 'src/external-modules/database/models';

@Injectable()
export class NutshellApiHandlerService {
  constructor(private readonly nutshellApiService: NutshellApiService) {}

  async createLead({
    account,
    order,
  }: {
    account: IAccountModelWithId;
    order: IEzManageOrder;
  }): Promise<string> {
    const { ref } = account;
    switch (ref) {
      case 'H4H':
        const { lead, invalidKeys } = outputH4HOrderToCrm({
          order,
        });

        if (invalidKeys.length > 0) {
          Sentry.captureMessage(
            `Invalid keys from outputH4HOrderToCrm: ${invalidKeys.join(', ')}`,
            'warning',
          );
        }

        if (account.newLeadTags) {
          lead.tags = account.newLeadTags;
        }

        const leadId = await this.nutshellApiService.createLead({
          ref,
          lead: { lead },
          orderName: order.orderNumber,
        });

        // if (account.newLeadTasks) {
        //   await Promise.all(
        //     account.newLeadTasks.map(async (t) =>
        //       this.nutshellApiService.addTaskToEntity({
        //         ref,
        //         task: {
        //           task: {
        //             title: t,
        //             entity: { entityType: 'Lead', id: leadId },
        //           },
        //         },
        //       }),
        //     ),
        //   ).catch((reason) => {
        //     Sentry.withScope((scope) => {
        //       scope.setExtra('message', `Tasks not added for lead ${leadId}`);
        //       Sentry.captureException(reason);
        //     });
        //   });
        // }
        return leadId;
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
