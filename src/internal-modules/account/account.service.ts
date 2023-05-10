import { Injectable, NotFoundException } from '@nestjs/common';
import { CustomLoggerService } from 'src/support-modules/custom-logger/custom-logger.service';
import { AccountDbHandlerService } from '../external-interface-handlers/database/account-db-handler/account-db-handler.service';
import { CatererDbHandlerService } from '../external-interface-handlers/database/caterer-db-handler/caterer-db-handler.service';

@Injectable()
export class AccountService {
  constructor(
    private readonly accountDbService: AccountDbHandlerService,
    private readonly catererDbService: CatererDbHandlerService,
    private readonly logger: CustomLoggerService,
  ) {}

  async findAccountByCatererId(catererId: string) {
    const caterer = await this.catererDbService.getCaterer(catererId);
    if (!caterer) {
      const msg = `Caterer not found with id ${catererId}`;
      this.logger.error(msg, {
        from: 'Internal module AccountService findAccountByCatererId',
      });
      throw new NotFoundException(msg);
    }

    const account = await this.accountDbService.getAccount(caterer.accountId);
    if (!account) {
      const msg = `Caterer with id ${catererId} found, but associated account not found`;
      this.logger.error(msg, {
        from: 'Internal module AccountService findAccountByCatererId',
      });
      throw new NotFoundException(msg);
    }
    return account;
  }
}
