import { Firestore, Query, WhereFilterOp } from '@google-cloud/firestore';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InternalError } from 'src/common/classes';
import { CollectionName } from './enum';
import { ICompositeAndFilter } from './interfaces';
import * as Sentry from '@sentry/node';

@Injectable()
export class DatabaseClientService {
  firestore: Firestore;
  constructor() {
    this.firestore = new Firestore();
  }

  getDocRef({
    collectionName,
    docId,
  }: {
    collectionName: CollectionName;
    docId: string;
  }) {
    return this.firestore.collection(collectionName).doc(docId);
  }

  async set({
    collectionName,
    docId,
    data,
  }: {
    collectionName: CollectionName;
    docId: string;
    data: Record<string, any>;
  }) {
    try {
      /**
       * @QUESTION to answer: Does set return the created object?
       */
      await this.firestore.collection(collectionName).doc(docId).set(data);
    } catch (err) {
      console.error('err', err);
      throw err;
    }
  }

  async add({
    collectionName,
    data,
  }: {
    collectionName: CollectionName;
    data: Record<string, any>;
  }) {
    try {
      const res = await this.firestore.collection(collectionName).add(data);
      return { id: res.id };
    } catch (err) {
      console.error('err', err);
      throw err;
    }
  }

  /**
   * Updates included fields
   */
  async update({
    collectionName,
    docId,
    data,
  }: {
    collectionName: CollectionName;
    docId: string;
    data: Record<string, any>;
  }) {
    try {
      await this.firestore.collection(collectionName).doc(docId).update(data);
    } catch (err: any) {
      const outErr = new InternalError('DB client update failed');
      if (
        err !== null &&
        typeof err === 'object' &&
        err.code === 5 &&
        typeof err.message === 'string' &&
        err.message.includes('NOT_FOUND')
      ) {
        outErr.message =
          'No matching record found with the provided document id';
      }
      Sentry.withScope((scope) => {
        scope.setExtras({ collectionName, docId, data });
        Sentry.captureException(err);
      });
      outErr.isLogged = true;
      throw outErr;
    }
  }

  async getOne({
    collectionName,
    docId,
  }: {
    collectionName: CollectionName;
    docId: string;
  }) {
    try {
      const data: FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData> =
        await this.firestore.collection(collectionName).doc(docId).get();
      if (!data.exists) return null;
      const record = data.data();
      return { id: data.id, ...record };
    } catch (err) {
      console.error('err', err);
      throw err;
    }
  }

  /**
   * These are good examples - but I don't think this is the right
   * *** SPECIAL NOTE ***
   * At the moment, this can only handle querying on a
   */
  async getMany({
    collectionName,
    filter,
  }: {
    collectionName: CollectionName;
    filter: { fieldPath: string; filterOp: WhereFilterOp; value: any };
  }) {
    const { fieldPath, filterOp, value } = filter;
    try {
      const records = await this.firestore
        .collection(collectionName)
        .where(fieldPath, filterOp, value)
        .get();
      return records;
    } catch (err) {
      console.error('err', err);
      throw err;
    }
  }

  /**
   * This method has one use:
   * An intersection of simple "==" filters ANDed together
   */
  async getManyIntersection({
    collectionName,
    filter,
  }: {
    collectionName: CollectionName;
    filter: ICompositeAndFilter;
  }) {
    try {
      if (!(filter.operator && filter.operator === 'AND')) {
        /**
         * log and throw
         */
        throw new InternalServerErrorException('Bad filter');
      }
      // const records = await this.firestore
      //   .collection(collectionName)
      //   .where(filter)
      //   .get();
      // return records;
      let query: Query = this.firestore.collection(collectionName);
      query = filter.filters.reduce((acc, cur) => {
        return acc.where(cur.fieldPath, cur.opStr, cur.value);
      }, query);
      const records = await query.get();
      return records;
    } catch (err) {
      console.error('err', err);
      throw err;
    }
  }

  async delete({
    collectionName,
    docId,
  }: {
    collectionName: CollectionName;
    docId: string;
  }) {
    try {
      await this.firestore.collection(collectionName).doc(docId).delete();
    } catch (err) {
      throw err;
    }
  }
}
