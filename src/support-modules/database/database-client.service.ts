import { Filter, Firestore } from '@google-cloud/firestore';
import { Injectable } from '@nestjs/common';
import { CollectionName } from './enum';

@Injectable()
export class DatabaseClientService {
  private firestore: Firestore;
  constructor() {
    this.firestore = new Firestore();
  }

  async create({
    collectionName,
    data,
  }: {
    collectionName: CollectionName;
    data: Record<string, any>;
  }) {
    try {
      const res = await this.firestore.collection(collectionName).add(data);
      return res;
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

  /**
   * These are good examples - but I don't think this is the right
   */
  async getMany({
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
