import { WhereFilterOp } from '@google-cloud/firestore';
import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { UUID } from 'src/common/types';
import { DatabaseClientService } from 'src/external-modules/database/database-client.service';
import { CollectionName } from 'src/external-modules/database/enum';
import { ICompositeAndFilter } from 'src/external-modules/database/interfaces';
import {
  IOrderModel,
  IOrderModelWithId,
} from 'src/external-modules/database/models';
import { CustomLoggerService } from 'src/support-modules/custom-logger/custom-logger.service';
import {
  IOrderRecordWithId,
  isIOrderRecord,
  OrderRecordInput,
} from './interfaces';

@Injectable()
export class OrderDbHandlerService {
  private collectionName: CollectionName;
  constructor(
    private readonly dbClientService: DatabaseClientService,
    private readonly logger: CustomLoggerService,
  ) {
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
        docId: orderId,
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

  async getManyForAccount(accountId: string) {
    const accountRef = this.dbClientService.getDocRef({
      collectionName: CollectionName.ACCOUNTS,
      docId: accountId,
    });

    const orders = await this.findMany({
      fieldPath: 'accountId',
      filterOp: '==',
      value: accountRef,
    });
    return orders;
  }

  async findByNameForAccount(orderName: string, accountId: string) {
    const accountRef = this.dbClientService.getDocRef({
      collectionName: CollectionName.ACCOUNTS,
      docId: accountId,
    });
    const filter: ICompositeAndFilter = {
      operator: 'AND',
      filters: [
        { fieldPath: 'name', opStr: '==', value: orderName },
        { fieldPath: 'accountId', opStr: '==', value: accountRef },
      ],
    };
    const records = await this.findManyIntersection(filter);

    if (records.length === 0) {
      throw new NotFoundException('No records found matching criteria');
    }

    if (records.length > 1) {
      this.logger.error('More than one order found matching specification', {
        orderName,
        accountId,
      });
    }

    return records[0];
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
    updates: Partial<
      Omit<IOrderModel, 'accountId' | 'catererId' | 'catererName'>
    >;
  }) {
    try {
      await this.dbClientService.update({
        collectionName: this.collectionName,
        docId,
        data: updates,
      });

      return { updated: true };
    } catch (err) {
      throw err;
    }
  }

  private async findMany(filter: {
    fieldPath: string;
    filterOp: WhereFilterOp;
    value: any;
  }) {
    const querySnapshot = await this.dbClientService.getMany({
      collectionName: this.collectionName,
      filter,
    });

    if (querySnapshot.empty) throw new NotFoundException('No records found');

    const records = querySnapshot.docs.reduce(
      (acc: IOrderModelWithId[], doc) => {
        const record = { id: doc.id, ...doc.data() };
        if (isIOrderRecord(record)) {
          acc.push(this.convertOrderRecordWithIdToOrderModelWithId(record));
        } else {
          /**
           * FAIL
           */
        }
        return acc;
      },
      [],
    );
    return records;
  }

  private async findManyIntersection(filter: ICompositeAndFilter) {
    const querySnapshot = await this.dbClientService.getManyIntersection({
      collectionName: this.collectionName,
      filter,
    });

    if (querySnapshot.empty) throw new NotFoundException('No records found');

    const records = querySnapshot.docs.reduce(
      (acc: IOrderModelWithId[], doc) => {
        const record = { id: doc.id, ...doc.data() };
        if (isIOrderRecord(record)) {
          acc.push(this.convertOrderRecordWithIdToOrderModelWithId(record));
        } else {
          /**
           * FAIL
           */
          console.error('FAIL');
        }
        return acc;
      },
      [],
    );
    return records;
  }

  private convertOrderRecordWithIdToOrderModelWithId(
    record: IOrderRecordWithId,
  ): IOrderModelWithId {
    return {
      id: record.id,
      accountId: record.accountId.id,
      catererId: record.catererId.id,
      catererName: record.catererName,
      name: record.name,
      status: record.status,
      crmId: record.crmId,
      crmDescription: record.crmDescription,
      acceptedAt: record.acceptedAt.toDate(),
      lastUpdatedAt: record.lastUpdatedAt.toDate(),
    };
  }
}
