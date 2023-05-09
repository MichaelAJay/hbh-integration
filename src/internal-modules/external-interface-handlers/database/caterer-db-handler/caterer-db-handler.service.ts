import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { DatabaseClientService } from 'src/external-modules/database/database-client.service';
import { CollectionName } from 'src/external-modules/database/enum';
import { isICatererModelWithId } from 'src/external-modules/database/models';

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
    const caterer = await this.dbClientService.getOne({
      collectionName: this.collectionName,
      docId: id,
    });

    if (!caterer)
      throw new UnprocessableEntityException('Could not find caterer');

    if (isICatererModelWithId(caterer)) {
      return caterer;
    } else {
      throw new UnprocessableEntityException(
        'Caterer does not match expected model',
      );
    }
  }
}

/**
 * Implementation note:  the DB handlers are a great place to make type checks
 */
