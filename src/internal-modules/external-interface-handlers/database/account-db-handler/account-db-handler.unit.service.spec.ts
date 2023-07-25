import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseClientService } from 'src/external-modules/database/database-client.service';
import { AccountDbHandlerService } from './account-db-handler.service';

describe('AccountDbHandlerService', () => {
  let service: AccountDbHandlerService;
  let dbClientService: DatabaseClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountDbHandlerService,
        {
          provide: DatabaseClientService,
          useValue: { getOne: jest.fn(), getMany: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<AccountDbHandlerService>(AccountDbHandlerService);
    dbClientService = module.get<DatabaseClientService>(DatabaseClientService);
  });

  describe('existence tests', () => {});

  describe('getAccount', () => {});
  describe('findByName', () => {});
  describe('findByRef', () => {});

  afterEach(() => jest.resetAllMocks());
});
