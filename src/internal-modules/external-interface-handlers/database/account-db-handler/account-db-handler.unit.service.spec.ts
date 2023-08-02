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

  describe('existence tests', () => {
    test('service is defined', () => expect(service).toBeDefined());
    test('dbClientService is defined', () =>
      expect(dbClientService).toBeDefined());
  });

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
  describe('findByName', () => {
    it('calls service findMany with the correct arguments', async () => {});
    it('propagates any error thrown by service findMany', async () => {});
    it('returns the result from service findMany on success', async () => {});
  });
  describe('findByRef', () => {
    it('calls service findMany with the correct arguments', async () => {});
    it('propagates any error thrown by service findMany', async () => {});
    it('returns the result from service findMany on success', async () => {});
  });
  describe('findMany', () => {
    it('calls dbClientService.getMany with the correct arguments', async () => {});
    it('throws NotFoundexception if querySnapshot.empty', async () => {});
    it('throws UnprocessableEntityException if returned record fails isAccountRecordWithId validation', async () => {});
    it('throws UnprocessableEntityException if returned record fails isAccountModelWithId validation', async () => {});
    it('returns an object with id matching input on success', async () => {});
    it('returns an object which adheres to the IAccountModelWithId interface on success', async () => {});
  });

  afterEach(() => jest.resetAllMocks());
});
