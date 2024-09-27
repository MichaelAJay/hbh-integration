import { WhereFilterOp } from '@google-cloud/firestore';
import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { DatabaseClientService } from 'src/external-modules/database/database-client.service';
import { AccountRef, CollectionName } from 'src/external-modules/database/enum';
import {
  IAccountModelWithId,
  isIAccountModelWithId,
} from 'src/external-modules/database/models';
import { isAccountRecordWithId } from './types';

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
      return this.findMany(filter);
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
      return this.findMany(filter);
    } catch (err) {
      throw err;
    }
  }

  /**
   * @TODO this really shouldn't be pulling one record
   * See Order Db Handler findMany
   */
  async findMany(filter: {
    fieldPath: string;
    filterOp: WhereFilterOp;
    value: any;
  }) {
    const querySnapshot = await this.dbClientService.getMany({
      collectionName: this.collectionName,
      filter,
    });

    if (querySnapshot.empty) throw new NotFoundException('No records found');
    const doc = querySnapshot.docs[0];
    const record = { id: doc.id, ...doc.data() };

    if (!isAccountRecordWithId(record))
      throw new UnprocessableEntityException(
        'Account record does not match expected model',
      );

    /**
     * Note:  Both of these checks are in place for continuity
     * It is unimportant in the case of the Record vs Model for Account
     * because there is no difference in type
     */
    if (!isIAccountModelWithId(record))
      throw new UnprocessableEntityException(
        'Account record does not match expected model',
      );

    return record as IAccountModelWithId;
  }
}
