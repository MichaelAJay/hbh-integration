import { Test, TestingModule } from '@nestjs/testing';
import { ExternalDatabaseModule } from 'src/external-modules/database/database.module';
import { DbTransportService } from './db-transport.service';

describe('DbTransportService', () => {
  let service: DbTransportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ExternalDatabaseModule],
      providers: [
        DbTransportService,
        {
          provide: 'TransportStreamOptions',
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<DbTransportService>(DbTransportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
