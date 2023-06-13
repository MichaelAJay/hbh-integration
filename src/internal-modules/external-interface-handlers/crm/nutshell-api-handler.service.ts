import { Injectable } from '@nestjs/common';
import { InternalError } from 'src/common/classes';
import { IEzManageOrder } from 'src/external-modules/ezmanage-api/interfaces/gql/responses';
import { NutshellApiService } from 'src/external-modules/nutshell-api/nutshell-api.service';
import { ACCOUNT_REF } from '../database/account-db-handler/types';
import { outputH4HOrderToCrm } from './utility';
import * as Sentry from '@sentry/node';

@Injectable()
export class NutshellApiHandlerService {
  constructor(private readonly nutshellApiService: NutshellApiService) {}

  async createLead({
    ref,
    order,
  }: {
    ref: ACCOUNT_REF;
    order: IEzManageOrder;
  }): Promise<string> {
    switch (ref) {
      case 'H4H':
        const { lead, invalidKeys } = outputH4HOrderToCrm(order);

        if (invalidKeys.length > 0) {
          Sentry.captureMessage(
            `Invalid keys from outputH4HOrderToCrm: ${invalidKeys.join(', ')}`,
            'warning',
          );
        }

        return await this.nutshellApiService.createLead({
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
