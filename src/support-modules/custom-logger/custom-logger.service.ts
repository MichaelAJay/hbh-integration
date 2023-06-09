import { Injectable, LoggerService } from '@nestjs/common';
import { DbTransportService } from './db-transport.service';
import winston = require('winston');
const { format } = winston;
const { combine, label, json, timestamp, printf } = format;

@Injectable()
export class CustomLoggerService implements LoggerService {
  private container: winston.Container;
  constructor(private dbTransport: DbTransportService) {
    this.container = new winston.Container();
    this.container.add('dbLogger', {
      format: combine(
        timestamp(),
        printf((info) => `${info.timestamp}`),
      ),
      transports: [new winston.transports.Console(), this.dbTransport],
    });

    this.container.add('consoleLogger', {
      format: combine(label({ label: 'console logger' })),
      transports: [new winston.transports.Console()],
    });
  }

  log(message: any, data: Record<string, any>) {
    const logger = this.container.get('dbLogger');
    logger.info(message, data);
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
