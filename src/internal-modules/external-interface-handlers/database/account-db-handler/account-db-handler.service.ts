import { WhereFilterOp } from '@google-cloud/firestore';
import { Injectable } from '@nestjs/common';
import { DatabaseClientService } from 'src/external-modules/database/database-client.service';
import { CollectionName } from 'src/external-modules/database/enum';

@Injectable()
export class AccountDbHandlerService {
  constructor(private readonly dbClientService: DatabaseClientService) {}
  async findByName(accountName: string) {
    try {
      const filter = {
        fieldPath: 'name',
        filterOp: '==' as WhereFilterOp,
        value: accountName,
      };
      const records = await this.dbClientService.getMany({
        collectionName: CollectionName.ACCOUNTS,
        filter,
      });
      return { id: '' };
    } catch (err) {
      throw err;
    }
  }
}
