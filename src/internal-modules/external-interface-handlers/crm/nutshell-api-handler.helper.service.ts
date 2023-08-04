import { Injectable } from '@nestjs/common';
import { CrmError } from 'src/common/classes';
import { IAccountModelWithId } from 'src/external-modules/database/models';
import { IEzManageOrder } from 'src/external-modules/ezmanage-api/interfaces/gql/responses';
import { NutshellApiService } from 'src/external-modules/nutshell-api/nutshell-api.service';
import {
  outputH4HOrderToCrm,
  compareEzManageSubtotalToCrmSubtotal,
} from './accounts/H4H/utility';
import { GeneratePrimaryNutshellEntityReturn } from './types/returns';
import * as Sentry from '@sentry/node';

@Injectable()
export class NutshellApiHandlerHelperService {
  constructor(private readonly nutshellApiService: NutshellApiService) {}

  async createLead({
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
          Sentry.withScope((scope) => {
            scope.setExtras({
              service: 'nutshellApiHandler',
              method: 'createLead',
              case: 'H4H',
              args: {
                account,
                order,
              },
            });
            Sentry.captureMessage(
              `Invalid keys from outputH4HOrderToCrm: ${invalidKeys.join(
                ', ',
              )}`,
              'warning',
            );
          });
        }

        const requiredTags = account.newLeadTags
          ? account.newLeadTags
              .filter((tag) => tag.isRequired)
              .map((tag) => tag.value)
          : [];
        if (requiredTags.length > 0) {
          lead.tags = requiredTags;
        }

        const { id, description, products, tags } =
          await this.nutshellApiService.createLead({
            ref,
            lead: { lead },
            orderName: order.orderNumber,
          });

        const isSubtotalMatch = compareEzManageSubtotalToCrmSubtotal({
          order,
          products,
        });

        return { crmId: id, description, isSubtotalMatch, tags };
      case 'ADMIN':
      default:
        const err = new CrmError(`Invalid ref ${ref}`);
        Sentry.captureException(err);
        err.isLogged = true;
        throw err;
    }
  }

  async updateLeadWithOrder({
    account,
    order,
    leadId,
    additionalAndExistingTags,
  }: {
    account: IAccountModelWithId;
    order: IEzManageOrder;
    leadId: string;
    additionalAndExistingTags?: string[];
  }) {
    const { ref } = account;
    switch (ref) {
      case 'H4H':
        const { lead, invalidKeys } = outputH4HOrderToCrm({
          order,
          account,
        });

        if (invalidKeys.length > 0) {
          Sentry.withScope((scope) => {
            scope.setExtras({
              service: 'nutshellApiHandler',
              method: 'updateLeadWithOrder',
              case: 'H4H',
              args: {
                account,
                order,
                leadId,
                additionalAndExistingTags,
              },
            });
            Sentry.captureMessage(
              `Invalid keys from outputH4HOrderToCrm: ${invalidKeys.join(
                ', ',
              )}`,
              'warning',
            );
          });
        }

        const tagSet: Set<string> = new Set();
        if (Array.isArray(account.newLeadTags)) {
          for (const tag of account.newLeadTags) {
            if (tag.isRequired) {
              tagSet.add(tag.value);
            }
          }
        }

        if (Array.isArray(additionalAndExistingTags)) {
          for (const tag of additionalAndExistingTags) {
            tagSet.add(tag);
          }
        }

        const allTags: string[] = Array.from(tagSet);

        if (allTags.length > 0) {
          lead.tags = allTags;
        }

        return await this.nutshellApiService.updateLead({
          leadId: parseInt(leadId, 10),
          ref,
          lead: { lead },
        });

      case 'ADMIN':
      default:
        const err = new CrmError(`Invalid ref ${ref}`);
        Sentry.captureException(err);
        err.isLogged = true;
        throw err;
    }
  }
}
