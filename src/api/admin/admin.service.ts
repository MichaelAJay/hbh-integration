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
}
