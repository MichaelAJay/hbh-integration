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

  describe('getCaterer', () => {
    it('calls dbClientService.getOne with the correct arguments', async () => {});
    it('returns null if dbClientService.getOne returns null', async () => {});
    it('throws UnprocessableEntityException if dbclientService.getOne returns a record which fails the isICatererRecord validation', async () => {});
    it('returns an object that adheres to the ICatererModelWithId interface on success', async () => {});
  });

  afterEach(() => jest.resetAllMocks());
});