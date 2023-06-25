import { Test, TestingModule } from '@nestjs/testing';
import { ExternalDatabaseModule } from 'src/external-modules/database/database.module';
import { CustomLoggerModule } from './custom-logger.module';
import { CustomLoggerService } from './custom-logger.service';
import { DbTransportService } from './db-transport.service';

describe('CustomLoggerService', () => {
  let service: CustomLoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ExternalDatabaseModule, CustomLoggerModule],
      providers: [
        DbTransportService,
        { provide: 'TransportStreamOptions', useValue: [] },
      ],
    }).compile();

    service = module.get<CustomLoggerService>(CustomLoggerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
