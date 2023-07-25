import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseClientService } from 'src/external-modules/database/database-client.service';
import { CatererDbHandlerService } from './caterer-db-handler.service';

describe('CatererDbHandlerService', () => {
  let service: CatererDbHandlerService;
  let dbClientService: DatabaseClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CatererDbHandlerService,
        { provide: DatabaseClientService, useValue: { getOne: jest.fn() } },
      ],
    }).compile();

    service = module.get<CatererDbHandlerService>(CatererDbHandlerService);
    dbClientService = module.get<DatabaseClientService>(DatabaseClientService);
  });

  describe('existence tests', () => {});

  describe('getCaterer', () => {});

  afterEach(() => jest.resetAllMocks());
});
