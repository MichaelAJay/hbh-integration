import { Injectable } from '@nestjs/common';
import { AdminInternalInterfaceService } from './admin-internal-interface.service';
import { AdminCreateUserBodyDto } from './dtos/body';

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

  async testNutshellIntegration({
    ref,
    a,
    b,
  }: {
    ref: string;
    a: number;
    b: number;
  }) {
    return await this.adminInternalInterface.testNutshellIntegration({
      ref,
      a,
      b,
    });
  }
}
