import { WhereFilterOp } from '@google-cloud/firestore';
import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { DatabaseClientService } from 'src/external-modules/database/database-client.service';
import { CollectionName } from 'src/external-modules/database/enum';
import { isIUserModelWithId } from 'src/external-modules/database/models';

@Injectable()
export class UserDbHandlerService {
  private collectionName: CollectionName;
  constructor(private readonly dbClientService: DatabaseClientService) {
    this.collectionName = CollectionName.USERS;
  }

  async getUser(userId: string) {
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

  async findByEmail(email: string) {
    try {
      const filter = {
        fieldPath: 'email',
        filterOp: '==' as WhereFilterOp,
        value: email,
      };
      const records = await this.dbClientService.getMany({
        collectionName: this.collectionName,
        filter,
      });
      /**
       * @TODO figure out how to deal w/ this return type
       */
    } catch (err) {
      throw err;
    }
  }
}