import { Injectable } from '@nestjs/common';
import { AdminInternalInterfaceService } from './admin-internal-interface.service';
import { AdminCreateUserBodyDto } from './dtos/body';
import { SentOrderToCrmQueryDto } from './dtos/query';

@Injectable()
export class AdminService {
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

  async getNutshellProducts({ ref }: { ref: string }) {
    return await this.adminInternalInterface.getCrmProducts({ ref });
  }

  async getCatererMenu({ catererId }: { catererId: string }) {
    return await this.adminInternalInterface.getCatererMenu({ catererId });
  }

  async sendOrderToCrm(input: SentOrderToCrmQueryDto) {
    return await this.adminInternalInterface.sendEzManageOrderToCrm(input);
  }
}
