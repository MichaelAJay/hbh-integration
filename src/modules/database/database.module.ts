import { Module } from '@nestjs/common';
import { DatabaseClientService } from './database-client.service';

@Module({
  providers: [DatabaseClientService],
})
export class DatabaseModule {}
