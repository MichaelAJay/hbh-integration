import { Injectable } from '@nestjs/common';
import { UUID } from 'src/common/types';
import { DatabaseClientService } from 'src/external-modules/database/database-client.service';
import { CollectionName } from 'src/external-modules/database/enum';
import { IOrderModel } from 'src/external-modules/database/models';

@Injectable()
export class OrderDbHandlerService {
  constructor(private readonly dbClientService: DatabaseClientService) {}

  /**
   * **********
   * * CREATE *
   * **********
   */
  async create({ orderId, data }: { orderId: UUID; data: IOrderModel }) {
    try {
      await this.dbClientService.set({
        collectionName: CollectionName.ORDERS,
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
  async findOne(orderId: string) {
    try {
      const order = await this.dbClientService.getOne({
        collectionName: CollectionName.ORDERS,
        docId: orderId,
      });
      return order;
    } catch (err) {
      console.error('err', err);
      throw err;
    }
  }
}
