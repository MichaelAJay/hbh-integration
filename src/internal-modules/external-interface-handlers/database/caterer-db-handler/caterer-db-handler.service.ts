import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { DatabaseClientService } from 'src/external-modules/database/database-client.service';
import { CollectionName } from 'src/external-modules/database/enum';
import { ICatererModelWithId } from 'src/external-modules/database/models';
import { isICatererRecord } from './interfaces';

@Injectable()
export class CatererDbHandlerService {
  private collectionName: CollectionName;
  constructor(private readonly dbClientService: DatabaseClientService) {
    this.collectionName = CollectionName.CATERERS;
  }

  /**
   * @param id catererId
   * @returns Caterer
   */
  async getCaterer(id: string) {
    const catererRecord = await this.dbClientService.getOne({
      collectionName: this.collectionName,
      docId: id,
    });

    if (!catererRecord)
      throw new UnprocessableEntityException('Could not find caterer');

    if (!isICatererRecord(catererRecord))
      throw new UnprocessableEntityException(
        'Caterer record does not match expected model',
      );

    const caterer: ICatererModelWithId = {
      ...catererRecord,
      accountId: catererRecord.accountId.id,
    };
    return caterer;
  }
}
