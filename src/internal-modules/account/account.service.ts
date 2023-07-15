import { Injectable, NotFoundException } from '@nestjs/common';
import {
  IAccountModelWithId,
  ICatererModelWithId,
} from 'src/external-modules/database/models';
import { AccountDbHandlerService } from '../external-interface-handlers/database/account-db-handler/account-db-handler.service';
import { CatererDbHandlerService } from '../external-interface-handlers/database/caterer-db-handler/caterer-db-handler.service';
import * as Sentry from '@sentry/node';

@Injectable()
export class AccountService {
  constructor(
    private readonly accountDbService: AccountDbHandlerService,
    private readonly catererDbService: CatererDbHandlerService,
  ) {}

  async findAccountByCatererId(
    catererId: string,
  ): Promise<{ caterer: ICatererModelWithId; account: IAccountModelWithId }> {
    const caterer = await this.catererDbService.getCaterer(catererId);
    if (!caterer) {
      const err = new NotFoundException(
        `Caterer not found with id ${catererId}`,
      );
      Sentry.withScope((scope) => {
        scope.setExtra(
          'from',
          'Internal module AccountService findAccountByCatererId',
        );
        Sentry.captureException(err);
      });
      throw err;
    }

    const account = await this.accountDbService.getAccount(caterer.accountId);
    if (!account) {
      const err = new NotFoundException(
        `Caterer with id ${catererId} found, but associated account not found`,
      );
      Sentry.captureException(err);
      throw err;
    }
    return { caterer, account };
  }

  async getEnvironmentVariablePrefixByCatererId(
    catererId: string,
  ): Promise<string> {
    const { account } = await this.findAccountByCatererId(catererId);
    return account.ref;
  }
}
