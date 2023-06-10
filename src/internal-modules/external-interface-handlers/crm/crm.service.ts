import { Injectable } from '@nestjs/common';
import { IAccountRecordWithId } from '../database/account-db-handler/interfaces';

@Injectable()
export class CrmService {
  constructor() {}

  /**
   * Need to think about a supertype
   */
  async generateCRMEntity({
    account,
    entity,
  }: {
    account: IAccountRecordWithId;
    entity: any;
  }) {}
}
