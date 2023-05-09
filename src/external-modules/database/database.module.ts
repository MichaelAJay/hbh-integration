import { Module } from '@nestjs/common';
import { DatabaseClientService } from './database-client.service';

@Module({
  providers: [DatabaseClientService],
  exports: [DatabaseClientService],
})
export class ExternalDatabaseModule {}
