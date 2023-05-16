import { WhereFilterOp } from '@google-cloud/firestore';
import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { DatabaseClientService } from 'src/external-modules/database/database-client.service';
import { CollectionName } from 'src/external-modules/database/enum';
import {
  isIUserModelWithId,
  IUserModel,
  IUserModelWithId,
} from 'src/external-modules/database/models';
import {
  isIUserRecordWithId,
  UserRecordInput,
} from './interfaces/user-record.interface';
import { UpdateUser } from './types/update-user.type';

@Injectable()
export class UserDbHandlerService {
  private collectionName: CollectionName;
  constructor(private readonly dbClientService: DatabaseClientService) {
    this.collectionName = CollectionName.USERS;
  }

  async getOne(userId: string) {
    try {
      const user = await this.dbClientService.getOne({
        collectionName: this.collectionName,
        docId: userId,
      });

      if (!user) throw new UnprocessableEntityException('Could not find user');

      if (isIUserModelWithId(user)) {
        return user;
      } else {
        throw new UnprocessableEntityException(
          'User does not match expected model',
        );
      }
    } catch (err) {
      throw err;
    }
  }

  async getOneByEmail(email: string) {
    try {
      const filter = {
        fieldPath: 'email',
        filterOp: '==' as WhereFilterOp,
        value: email,
      };
      const querySnapshot = await this.dbClientService.getMany({
        collectionName: this.collectionName,
        filter,
      });

      if (querySnapshot.empty) throw new NotFoundException('No records found');
      const doc = querySnapshot.docs[0];
      const record = { id: doc.id, ...doc.data() };

      if (!isIUserRecordWithId(record)) {
        throw new UnprocessableEntityException(
          'User record does not match expected model',
        );
      }

      const user: IUserModelWithId = {
        ...record,
        accountId: record.accountId.id,
      };

      return user;
    } catch (err) {
      throw err;
    }
  }

  async createOne(user: IUserModel) {
    try {
      const accountRef = this.dbClientService.getDocRef({
        collectionName: CollectionName.ACCOUNTS,
        docId: user.accountId,
      });

      const data: UserRecordInput = { ...user, accountId: accountRef };
      return await this.dbClientService.add({
        collectionName: this.collectionName,
        data,
      });
    } catch (err) {
      throw err;
    }
  }

  async updateOne({
    userId: docId,
    updates,
  }: {
    userId: string;
    updates: UpdateUser;
  }) {
    try {
      await this.dbClientService.update({
        collectionName: this.collectionName,
        docId,
        data: updates,
      });
    } catch (err) {
      throw err;
    }
  }
}
