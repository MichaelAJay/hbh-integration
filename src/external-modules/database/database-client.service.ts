import { Firestore, Query, WhereFilterOp } from '@google-cloud/firestore';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DatabaseClientError, InternalError } from 'src/common/classes';
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
    /**
     * @QUESTION to answer: Does set return the created object?
     */
    return await this.firestore
      .collection(collectionName)
      .doc(docId)
      .set(data)
      .catch((reason) => {
        const err = new DatabaseClientError('DB set operation failed');
        Sentry.withScope((scope) => {
          scope.setExtras({
            arguments: {
              collectionName,
              docId,
              data,
            },
            reason,
          });
          Sentry.captureException(err);
        });
        err.isLogged = true;
        throw err;
      });
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
    } catch (reason) {
      const err = new DatabaseClientError('Db add operation failed');
      Sentry.withScope((scope) => {
        scope.setExtras({
          arguments: {
            collectionName,
            data,
          },
          reason,
        });
        Sentry.captureException(err);
      });
      err.isLogged = true;
      throw err;
    }
  }

  /**
   * Updates included fields
   *
   * Whatever calls this should really be the one logging the error
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
      const outErr = new DatabaseClientError('DB update operation failed');
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
    } catch (reason) {
      const err = new DatabaseClientError('DB get operation failed');
      Sentry.withScope((scope) => {
        scope.setExtras({
          arguments: {
            collectionName,
            docId,
          },
          reason,
        });
        Sentry.captureException(err);
      });
      err.isLogged = true;
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
    return await this.firestore
      .collection(collectionName)
      .where(fieldPath, filterOp, value)
      .get()
      .catch((reason) => {
        const err = new DatabaseClientError('DB get operation failed');
        Sentry.withScope((scope) => {
          scope.setExtras({
            arguments: {
              collectionName,
              filter,
            },
            reason,
          });
          Sentry.captureException(err);
        });
        err.isLogged = true;
        throw err;
      });
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
      return await query.get();
    } catch (reason) {
      const err = new DatabaseClientError('DB get operation failed');
      Sentry.withScope((scope) => {
        scope.setExtras({
          arguments: {
            collectionName,
            filter,
          },
          reason,
        });
        Sentry.captureException(err);
      });
      err.isLogged = true;
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
    return await this.firestore
      .collection(collectionName)
      .doc(docId)
      .delete()
      .catch((reason) => {
        const err = new DatabaseClientError('DB delete operation failed');
        Sentry.withScope((scope) => {
          scope.setExtras({
            arguments: {
              collectionName,
              docId,
            },
            reason,
          });
          Sentry.captureException(err);
        });
        err.isLogged = true;
        throw err;
      });
  }
}
