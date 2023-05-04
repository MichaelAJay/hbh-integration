import { Inject, Injectable, OnApplicationShutdown } from '@nestjs/common';
import { ClientSession, Db, MongoClient } from 'mongodb';

@Injectable()
export class DatabaseClientService implements OnApplicationShutdown {
  constructor(
    @Inject('DATABASE_CONNECTION')
    private client: MongoClient,
  ) {}

  async onApplicationShutdown(signal?: string | undefined) {
    await this.client.close();
  }

  /**
   *
   * Properly type the query function
   * so we don't have to explicitly type the return value
   */
  async runQuery<T>(query: (db: Db) => Promise<T>) {
    try {
      const db = this.client.db(process.env.DATABASE_NAME);
      return await query(db);
    } catch (err) {
      console.error('Run query failed', err);
      throw err;
    }
  }

  async runTransaction<T>(
    queries: ((session: ClientSession, db: Db) => Promise<T>)[],
  ) {
    // await this.client.connect().catch((reason) => {
    //   console.error('Client could not establish connection', reason);
    //   throw reason;
    // });
    try {
      const db = this.client.db(process.env.DATABASE_NAME);
      const session = this.client.startSession();
      session.startTransaction();

      try {
        // lets stick to this for now since...
        for (const query of queries) await query(session, db);

        // using promise.all not sure if this will work since no way to test this for now.
        // await Promise.all(queries.map(async (query) => query(session, db)));

        await session.commitTransaction();
      } catch (err) {
        session.abortTransaction();
        console.error('Transaction failed', err);
        return false;
      } finally {
        session.endSession();
        return true;
      }
    } catch (err) {
      console.error('Transfer failed', err);
      throw err;
    }
  }
}
