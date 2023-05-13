import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { UUID } from 'src/common/types';
import { DatabaseClientService } from 'src/external-modules/database/database-client.service';
import { CollectionName } from 'src/external-modules/database/enum';
import {
  IOrderModel,
  IOrderModelWithId,
} from 'src/external-modules/database/models';
import { isIOrderRecord, OrderRecordInput } from './interfaces';

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
      const accountRef = this.dbClientService.getDocRef({
        collectionName: CollectionName.ACCOUNTS,
        docId: data.accountId,
      });
      const catererRef = this.dbClientService.getDocRef({
        collectionName: CollectionName.CATERERS,
        docId: data.catererId,
      });

      const input: OrderRecordInput = {
        ...data,
        accountId: accountRef,
        catererId: catererRef,
      };

      await this.dbClientService.set({
        collectionName: this.collectionName,
        orderId,
        data: input,
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
      const orderRecord = await this.dbClientService.getOne({
        collectionName: this.collectionName,
        docId: orderId,
      });

      if (!orderRecord) return null;

      /**
       * @START
       * @TODO - use isIOrderRecord instead & convert if so
       */
      if (!isIOrderRecord(orderRecord)) {
        throw new UnprocessableEntityException(
          'Order record does not match expected model',
        );
      }

      const order: IOrderModelWithId = {
        ...orderRecord,
        accountId: orderRecord.accountId.id,
        catererId: orderRecord.catererId.id,
        acceptedAt: orderRecord.acceptedAt.toDate(),
        lastUpdatedAt: orderRecord.lastUpdatedAt.toDate(),
      };

      return order;
    } catch (err) {
      console.error('err', err);
      throw err;
    }
  }

  /**
   * **********
   * * UPDATE *
   * **********
   */
  async updateOne({
    orderId: docId,
    updates,
  }: {
    orderId: UUID;
    updates: Partial<IOrderModel>;
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
