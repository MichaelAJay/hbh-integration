import { Injectable } from '@nestjs/common';
import { AdminInternalInterfaceService } from './admin-internal-interface.service';
import { AdminCreateUserBodyDto } from './dtos/body';
import {
  AdminOrderNameWithAccountScopeQueryDto,
  SentOrderToCrmQueryDto,
} from './dtos/query';

@Injectable()
export class AdminAPIService {
  constructor(
    private readonly adminInternalInterface: AdminInternalInterfaceService,
  ) {}

  async createUser(body: AdminCreateUserBodyDto) {
    const val = await this.adminInternalInterface.createUser(body);
    return { msg: 'User created', ...val };
  }

  async getOrderNamesForAccount(accountId: string) {
    return await this.adminInternalInterface.getOrderNamesForAccount(accountId);
  }

  async getCrmProducts({ accountId }: { accountId: string }) {
    return await this.adminInternalInterface.getCrmProducts({ accountId });
  }

  async getCatererMenu({ catererId }: { catererId: string }) {
    return await this.adminInternalInterface.getCatererMenu({ catererId });
  }

  async sendEzManageOrderToCrm(input: SentOrderToCrmQueryDto) {
    return await this.adminInternalInterface.sendEzManageOrderToCrm(input);
  }

  async getCrmEntityFromOrderName(
    input: AdminOrderNameWithAccountScopeQueryDto,
  ) {
    return await this.adminInternalInterface.getCrmEntityFromOrderName(input);
  }
}
