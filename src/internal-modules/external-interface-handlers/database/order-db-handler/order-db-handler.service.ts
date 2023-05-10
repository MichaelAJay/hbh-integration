import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { UUID } from 'src/common/types';
import { DatabaseClientService } from 'src/external-modules/database/database-client.service';
import { CollectionName } from 'src/external-modules/database/enum';
import {
  IOrderModel,
  isIOrderModelWithId,
} from 'src/external-modules/database/models';

@Injectable()
export class OrderDbHandlerService {
  private collectionName: CollectionName;
  constructor(private readonly dbClientService: DatabaseClientService) {
    this.collectionName = CollectionName.ORDERS;
  }

  /**
   * **********
   * * CREATE *
   * **********
   */
  async create({ orderId, data }: { orderId: UUID; data: IOrderModel }) {
    try {
      await this.dbClientService.set({
        collectionName: this.collectionName,
        orderId,
        data,
      });
    } catch (err) {
      console.error('err', err);
      throw err;
    }
  }

  /**
   * ********
   * * READ *
   * ********
   */
  async getOne(orderId: string) {
    try {
      const order = await this.dbClientService.getOne({
        collectionName: this.collectionName,
        docId: orderId,
      });

      if (!order) throw new NotFoundException('Could not find order');

      if (isIOrderModelWithId(order)) {
        return order;
      } else {
        throw new UnprocessableEntityException(
          'Order does not match expected model',
        );
      }
    } catch (err) {
      console.error('err', err);
      throw err;
    }
  }
}
