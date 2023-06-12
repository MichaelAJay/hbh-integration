import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { IEzManageOrder } from 'src/external-modules/ezmanage-api/interfaces/gql/responses';
import { NutshellApiService } from 'src/external-modules/nutshell-api/nutshell-api.service';
import { ACCOUNT_REF } from '../database/account-db-handler/types';
import { outputH4HOrderToCrm } from './utility';

@Injectable()
export class NutshellApiHandlerService {
  constructor(private readonly nutshellApiService: NutshellApiService) {}

  async createLead({
    ref,
    order,
  }: {
    ref: ACCOUNT_REF;
    order: IEzManageOrder;
  }) {
    switch (ref) {
      case 'H4H':
        const { lead, invalidKeys } = outputH4HOrderToCrm(order);
        return await this.nutshellApiService.createLead({
          ref,
          lead: { lead },
        });
      case 'ADMIN':
      default:
        /** LOG */
        throw new InternalServerErrorException(`Invalid ref ${ref}`);
    }
  }

  async getProducts({ ref }: { ref: any }) {
    try {
      return await this.nutshellApiService.getProducts({ ref });
    } catch (err) {
      throw err;
    }
  }
}
