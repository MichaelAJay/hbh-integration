import { Injectable } from '@nestjs/common';
import { DatabaseClientService } from './database-client.service';
import { CollectionName } from './enum';
import { IOrderModel } from './models';

@Injectable()
export class OrderDbService {
  constructor(private readonly dbClientService: DatabaseClientService) {}

  async create({ id, name, date }: { id: string; name: string; date: Date }) {
    try {
      return await this.dbClientService.runQuery(async (db) => {
        const record = await db
          .collection<IOrderModel>(CollectionName.ORDERS)
          .insertOne({ id, date, name });
        return record;
      });
    } catch (err) {
      console.error('err', err);
      throw err;
    }
  }
}
