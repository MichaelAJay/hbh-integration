import { Injectable } from '@nestjs/common';
import { AccountDbHandlerService } from '../external-interface-handlers/database/account-db-handler/account-db-handler.service';
import { CatererDbHandlerService } from '../external-interface-handlers/database/caterer-db-handler/caterer-db-handler.service';

@Injectable()
export class AccountService {
  constructor(
    private readonly accountDbService: AccountDbHandlerService,
    private readonly catererDbService: CatererDbHandlerService,
  ) {}

  async findAccountByCatererId(catererId: string) {
    const caterer = await this.catererDbService.getCaterer(catererId);
    const account = await this.accountDbService.getAccount(caterer.accountId);
    return account;
  }
}
