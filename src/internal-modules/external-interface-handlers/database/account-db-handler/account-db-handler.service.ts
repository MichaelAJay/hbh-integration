import { WhereFilterOp } from '@google-cloud/firestore';
import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { DatabaseClientService } from 'src/external-modules/database/database-client.service';
import { AccountRef, CollectionName } from 'src/external-modules/database/enum';
import { isIAccountModelWithId } from 'src/external-modules/database/models';

@Injectable()
export class AccountDbHandlerService {
  private collectionName: CollectionName;
  constructor(private readonly dbClientService: DatabaseClientService) {
    this.collectionName = CollectionName.ACCOUNTS;
  }

  async getAccount(accountId: string) {
    try {
      const account = await this.dbClientService.getOne({
        collectionName: this.collectionName,
        docId: accountId,
      });

      if (!account) return null;

      if (isIAccountModelWithId(account)) {
        return account;
      } else {
        throw new UnprocessableEntityException(
          'Account does not match expected model',
        );
      }
    } catch (err) {
      throw err;
    }
  }
  async findByName(accountName: string) {
    try {
      const filter = {
        fieldPath: 'name',
        filterOp: '==' as WhereFilterOp,
        value: accountName,
      };
      const records = await this.dbClientService.getMany({
        collectionName: this.collectionName,
        filter,
      });
      return { id: '' };
    } catch (err) {
      throw err;
    }
  }

  async findByRef(ref: AccountRef) {
    try {
      const filter = {
        fieldPath: 'ref',
        filterOp: '==' as WhereFilterOp,
        value: ref,
      };

      const records = await this.dbClientService.getMany({
        collectionName: this.collectionName,
        filter,
      });
      return { id: '' };
    } catch (err) {
      throw err;
    }
  }
}
