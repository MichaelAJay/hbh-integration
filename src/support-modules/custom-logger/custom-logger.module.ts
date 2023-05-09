import { Module } from '@nestjs/common';
import { TransportStreamOptions } from 'winston-transport';
import { DatabaseClientService } from '../../external-modules/database/database-client.service';
import { CustomLoggerService } from './custom-logger.service';
import { DbTransportService } from './db-transport.service';

const transportStreamOptionsFactory = {
  provide: 'TransportStreamOptions',
  useFactory: (): TransportStreamOptions => {
    return { level: 'info' };
  },
};

@Module({
  providers: [
    CustomLoggerService,
    DbTransportService,
    DatabaseClientService,
    transportStreamOptionsFactory,
  ],
  exports: [CustomLoggerService, DbTransportService],
})
export class CustomLoggerModule {}
