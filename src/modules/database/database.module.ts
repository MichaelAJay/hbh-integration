import { InternalServerErrorException, Module } from '@nestjs/common';
import { Db, MongoClient } from 'mongodb';
import { DatabaseClientService } from './database-client.service';
import { OrderDbService } from './order-db.service';

@Module({
  providers: [
    {
      provide: 'DATABASE_CONNECTION',
      useFactory: async (): Promise<Db> => {
        if (!process.env.DATABASE_CONNECTION_STRING)
          throw new InternalServerErrorException({
            errors: ['Database url string not configured'],
          });
        try {
          const client = new MongoClient(
            process.env.DATABASE_CONNECTION_STRING,
          );
          return client.db('primary');
        } catch (err) {
          throw err;
        }
      },
    },
    DatabaseClientService,
    OrderDbService,
  ],
})
export class DatabaseModule {}
