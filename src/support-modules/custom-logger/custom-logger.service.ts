import { Injectable, LoggerService } from '@nestjs/common';
import { DbTransportService } from './db-transport.service';
import winston = require('winston');
const { format } = winston;
const { combine, label, json } = format;

@Injectable()
export class CustomLoggerService implements LoggerService {
  private container: winston.Container;
  constructor(private dbTransport: DbTransportService) {
    this.container = new winston.Container();
    this.container.add('dbLogger', {
      format: combine(label({ label: 'db logger' })),
      transports: [new winston.transports.Console(), this.dbTransport],
    });

    this.container.add('consoleLogger', {
      format: combine(label({ label: 'console logger' })),
      transports: [new winston.transports.Console()],
    });

    // this.logger = winston.createLogger({
    //   level: 'info',
    //   format: winston.format.json(),
    //   defaultMeta: { service: 'user-service' },
    //   transports: [new winston.transports.Console(), dbTransport],
    // });
  }

  log(message: any, data: Record<string, any>) {
    // throw new Error('Method not implemented.');
    const logger = this.container.get('consoleLogger');
    logger.info(message);
  }

  warn(message: any, data: Record<string, any>) {
    const logger = this.container.get('consoleLogger');
    logger.warn(message);
  }

  error(message: any, data: Record<string, any>) {
    const logger = this.container.get('dbLogger');
    logger.error(message, data);
  }

  debug(message: any, data: Record<string, any>) {
    const logger = this.container.get('consoleLogger');
    logger.debug(message);
  }
}
