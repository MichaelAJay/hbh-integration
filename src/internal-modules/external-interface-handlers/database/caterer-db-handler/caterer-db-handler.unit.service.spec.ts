import { Test, TestingModule } from '@nestjs/testing';
import { ExternalDatabaseModule } from 'src/external-modules/database/database.module';
import { CatererDbHandlerService } from './caterer-db-handler.service';

describe('CatererDbHandlerService', () => {
  let service: CatererDbHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ExternalDatabaseModule],
      providers: [CatererDbHandlerService],
    }).compile();

    service = module.get<CatererDbHandlerService>(CatererDbHandlerService);
  });

  describe('existence tests', () => {});

  describe('getCaterer', () => {});

  afterEach(() => jest.resetAllMocks());
});
