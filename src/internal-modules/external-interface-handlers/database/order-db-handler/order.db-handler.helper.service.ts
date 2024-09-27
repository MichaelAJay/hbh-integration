import { WhereFilterOp } from '@google-cloud/firestore';
import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseClientService } from 'src/external-modules/database/database-client.service';
import { CollectionName } from 'src/external-modules/database/enum';
import { ICompositeAndFilter } from 'src/external-modules/database/interfaces';
import { IOrderModelWithId } from 'src/external-modules/database/models';
import { isIOrderRecord, IOrderRecordWithId } from './interfaces';

@Injectable()
export class OrderDbHandlerHelperService {
  private collectionName: CollectionName;
  constructor(private readonly dbClientService: DatabaseClientService) {
    this.collectionName = CollectionName.ORDERS;
  }

  async findMany(filter: {
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

  async findManyIntersection(filter: ICompositeAndFilter) {
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

  convertOrderRecordWithIdToOrderModelWithId(
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
