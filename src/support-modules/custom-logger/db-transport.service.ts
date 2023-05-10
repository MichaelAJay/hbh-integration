import { Inject, Injectable } from '@nestjs/common';
// import Transport from 'winston-transport';
import { DatabaseClientService } from '../../external-modules/database/database-client.service';
import { CollectionName } from '../../external-modules/database/enum';
// const Transport = require('winston-transport');
import Transport, { TransportStreamOptions } from 'winston-transport';

@Injectable()
export class DbTransportService extends Transport {
  constructor(
    private readonly dbClientService: DatabaseClientService,
    @Inject('TransportStreamOptions') opts: TransportStreamOptions,
  ) {
    super(opts);
  }

  log(info, callback) {
    setImmediate(() => {
      this.emit('logged', info);
    });
    /**
     * Info will be an object with this form:
     * {
     *  message: string
     *  level: string
     *  ...metadata
     * }
     */
    console.log('info', info);
    try {
      this.dbClientService.add({
        collectionName: CollectionName.LOGS,
        data: info,
      });
      callback();
    } catch (err) {
      console.error('err', err);
      callback(err);
    }
  }
}
