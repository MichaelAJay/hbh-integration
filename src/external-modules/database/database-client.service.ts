import { Filter, Firestore, WhereFilterOp } from '@google-cloud/firestore';
import { Injectable } from '@nestjs/common';
import { CollectionName } from './enum';

@Injectable()
export class DatabaseClientService {
  private firestore: Firestore;
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
    } catch (err) {
      console.error('err', err);
      throw err;
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

  async getManyCompound({
    collectionName,
    filter,
  }: {
    collectionName: CollectionName;
    filter: Filter;
  }) {
    try {
      const records = await this.firestore
        .collection(collectionName)
        .where(filter)
        .get();
      return records;
    } catch (err) {
      console.error('err', err);
      throw err;
    }
  }

  async deleteDocument({
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
