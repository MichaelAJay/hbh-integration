import { Injectable } from '@nestjs/common';
import { DatabaseClientService } from 'src/support-modules/database/database-client.service';
import { UUID } from 'src/common/types';
import { IOrderModel } from 'src/support-modules/database/models';
import { CollectionName } from 'src/support-modules/database/enum';

@Injectable()
export class OrderDbService {
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
