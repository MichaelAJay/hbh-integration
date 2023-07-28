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

  describe('getAccount', () => {
    it('calls dbClientService.getOne with the correct arguments', async () => {});
    it('propagates any error thrown by dbClientService.getOne', async () => {});
    it('returns null if account is null & does not call isIAccountModelWithId validator', async () => {});
    describe('returned account from dbClientService.getOne passes isIAccountModelWithId validation', () => {
      it('returns account returned by dbclientService.getOne', async () => {});
    });
    describe('returned account from dbClientService.getOne does not pass isIAccountModelWithId validation', () => {
      it('throws UnprocessableEntityException error', async () => {});
    });
  });
  describe('findByName', () => {});
  describe('findByRef', () => {});

  afterEach(() => jest.resetAllMocks());
});
